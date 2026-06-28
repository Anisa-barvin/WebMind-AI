const Website = require('../models/Website');
const CrawledPage = require('../models/CrawledPage');
const Chunk = require('../models/Chunk');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Documentation = require('../models/Documentation');
const crawlerService = require('../services/crawlerService');
const embeddingService = require('../services/embeddingService');
const vectorStoreService = require('../services/vectorStoreService');
const groqService = require('../services/groqService');
const { URL } = require('url');

/**
 * Helper to extract name from URL if not provided
 */
function getHostname(urlStr) {
  try {
    const obj = new URL(urlStr);
    return obj.hostname.replace('www.', '');
  } catch (e) {
    return 'Website';
  }
}

/**
 * Background worker to run Crawl, Chunk, Embed, Index, Summarize
 */
async function runTrainingPipeline(websiteId, url, name) {
  let website;
  try {
    website = await Website.findById(websiteId);
    if (!website) return;

    await website.addLog(`Starting training pipeline for ${url}`, 'info');

    // 1. Crawl
    await website.addLog('Stage Started: Crawling', 'info');
    await Website.updateOne({ _id: websiteId }, { $set: { currentStage: 'crawling' } });

    let pages;
    try {
      pages = await crawlerService.crawlWebsite(url, 50, async (progressInfo) => {
        // Only log every 20% or significant milestones to avoid DB spam
        if (progressInfo.progress % 20 === 0 || progressInfo.progress === 5 || progressInfo.progress === 100) {
          await website.addLog(`Crawl progress: ${progressInfo.progress}% - ${progressInfo.log}`, 'info');
        }
        await Website.updateOne(
          { _id: websiteId },
          { $set: { pagesFound: progressInfo.pagesCount } }
        );
      });
    } catch (crawlErr) {
      await website.addLog(`Stage Failed: Crawling - ${crawlErr.message}`, 'error');
      throw new Error(`Crawl stage failed: ${crawlErr.message}`);
    }

    if (!pages || pages.length === 0) {
      await website.addLog('Stage Failed: Crawling - No pages found', 'error');
      throw new Error('No pages could be crawled from the provided URL. Content might be too short or inaccessible.');
    }

    await website.addLog(`Stage Completed: Crawling. Found ${pages.length} pages.`, 'success');
    await Website.updateOne(
      { _id: websiteId }, 
      { $set: { pagesFound: pages.length, currentStage: 'indexing', totalPages: pages.length } }
    );

    // 2. Chunk & Embed
    await website.addLog('Stage Started: Chunking and Embedding', 'info');
    await Website.updateOne({ _id: websiteId }, { $set: { currentStage: 'embedding' } });
    
    const allChunks = [];
    const savedPages = [];

    let localPagesProcessed = 0;
    let localEmbeddingsGenerated = 0;

    try {
      for (let page of pages) {
        // Save CrawledPage to MongoDB
        const crawledPage = await CrawledPage.create({
          websiteId,
          url: page.url,
          title: page.title,
          description: page.description,
          content: page.content,
          contentLength: page.contentLength
        });
        savedPages.push(crawledPage);
        
        localPagesProcessed += 1;
        
        // Create chunks
        const textChunks = embeddingService.chunkText(page.content, 800, 150);
        
        for (let i = 0; i < textChunks.length; i++) {
          const text = textChunks[i];
          
          // Generate embedding vector
          const result = await embeddingService.getEmbedding(text);
          if (!result || !result.success) {
             await website.addLog(`Embedding failed for a chunk: ${result ? result.error : 'Unknown'}. Skipping chunk.`, 'warn');
             continue;
          }
          const embedding = result.values;
          localEmbeddingsGenerated += 1;
          
          allChunks.push({
            websiteId,
            pageId: crawledPage._id,
            text,
            sourceUrl: page.url,
            chunkNumber: i + 1,
            embedding
          });
          
          // Save progress periodically using atomic update
          if (allChunks.length % 10 === 0) {
            await Website.updateOne(
              { _id: websiteId },
              { $set: { pagesProcessed: localPagesProcessed, embeddingsGenerated: localEmbeddingsGenerated } }
            );
          }
        }
      }
      
      // Final sync for counters
      await Website.updateOne(
        { _id: websiteId },
        { $set: { pagesProcessed: localPagesProcessed, embeddingsGenerated: localEmbeddingsGenerated } }
      );
      
    } catch (embedErr) {
      await website.addLog(`Stage Failed: Chunking and Embedding - ${embedErr.message}`, 'error');
      throw new Error(`Embedding stage failed: ${embedErr.message}`);
    }
    
    await website.addLog(`Pages processed: ${localPagesProcessed}, Chunks created: ${allChunks.length}`, 'info');

    if (allChunks.length === 0) {
      await website.addLog('Stage Failed: Chunking and Embedding - No chunks generated', 'error');
      throw new Error('No chunks were generated from the crawled pages. Content may be empty or unparseable.');
    }

    await website.addLog(`Stage Completed: Chunking and Embedding. Generated ${allChunks.length} vectors.`, 'success');

    // 3. Index/Store vectors
    await website.addLog('Stage Started: Vector Storage', 'info');
    await Website.updateOne({ _id: websiteId }, { $set: { currentStage: 'saving' } });
    
    let vStatus = 'mongo';
    try {
      vStatus = await vectorStoreService.addChunks(websiteId, allChunks);
      await Website.updateOne({ _id: websiteId }, { $set: { vectorStatus: vStatus } });
    } catch (storeErr) {
      await website.addLog(`Stage Failed: Vector Storage - ${storeErr.message}`, 'error');
      throw new Error(`Vector storage failed: ${storeErr.message}`);
    }
    await website.addLog('Stage Completed: Vector Storage.', 'success');

    // 4. Summarization
    await website.addLog('Stage Started: Summarization', 'info');
    let finalSummary = {
      executiveSummary: 'No executive summary generated.',
      mainTopics: [],
      keyServices: [],
      importantInfo: []
    };
    
    try {
      const pageTexts = pages.slice(0, 3).map(p => `Page Title: ${p.title}\nPage Text: ${p.content}`);
      const summary = await groqService.generateWebsiteSummary(name, pageTexts);
      
      finalSummary = {
        executiveSummary: summary.executiveSummary || 'No executive summary generated.',
        mainTopics: summary.mainTopics || [],
        keyServices: summary.keyServices || [],
        importantInfo: summary.importantInfo || [],
        technologies: summary.technologies || [],
        keywords: summary.keywords || [],
        category: summary.category || 'Uncategorized',
        contactInfo: summary.contactInfo || [],
        socialLinks: summary.socialLinks || [],
        aiConfidenceScore: typeof summary.aiConfidenceScore === 'number' ? summary.aiConfidenceScore : 85
      };
      await website.addLog('Stage Completed: Summarization.', 'success');
    } catch (sumErr) {
      await website.addLog(`Stage Failed: Summarization - ${sumErr.message} (Non-fatal)`, 'warn');
      // Non-fatal, continue
    }

    // 4.5. Generate Full Documentation
    await website.addLog('Stage Started: Documentation Generation', 'info');
    try {
      // Use more text for documentation (up to 10 pages)
      const docPageTexts = pages.slice(0, 10).map(p => `Page Title: ${p.title}\nPage Text: ${p.content}`);
      const docData = await groqService.generateFullDocumentation(name, docPageTexts, finalSummary);
      
      await Documentation.findOneAndUpdate(
        { websiteId: website._id },
        { 
          userId: website.userId,
          executiveSummary: docData.executiveSummary || finalSummary.executiveSummary,
          websiteOverview: docData.websiteOverview || '',
          mainTopics: docData.mainTopics || finalSummary.mainTopics,
          keyServices: docData.keyServices || finalSummary.keyServices,
          technologies: docData.technologies || finalSummary.technologies,
          importantPages: docData.importantPages || [],
          contactInfo: docData.contactInfo || finalSummary.contactInfo,
          faq: docData.faq || [],
          keywords: docData.keywords || finalSummary.keywords,
          aiInsights: docData.aiInsights || [],
          websiteStats: {
             totalPages: pages.length,
             totalChunks: allChunks.length
          }
        },
        { upsert: true, new: true }
      );
      
      await website.addLog('Stage Completed: Documentation Generation.', 'success');
    } catch (docErr) {
      await website.addLog(`Stage Failed: Documentation Generation - ${docErr.message} (Non-fatal)`, 'warn');
    }

    // 5. Wrap up
    await website.addLog('Stage Started: Wrap up', 'info');
    await website.addLog('Training pipeline successfully completed.', 'success');
    await Website.updateOne(
      { _id: websiteId },
      { 
        $set: { 
          status: 'ready', 
          currentStage: 'completed', 
          totalChunks: allChunks.length,
          summary: finalSummary
        } 
      }
    );
    await website.addLog('Stage Completed: Wrap up.', 'success');

  } catch (error) {
    if (website) {
      try {
        await website.addLog(`CRITICAL FAILURE: ${error.message}\nStack: ${error.stack}`, 'error');
        await Website.updateOne(
          { _id: websiteId },
          { $set: { status: 'failed', currentStage: 'failed', currentError: error.message } }
        );
      } catch (logErr) {
        console.error('Failed to write error log to Website', logErr);
      }
    }
  }
}

/**
 * @desc    Train website (Submit URL, start crawl/embed)
 * @route   POST /api/websites/train
 * @access  Private
 */
const trainWebsite = async (req, res) => {
  try {
    const { url } = req.body;
    let { name } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, error: 'Please provide website URL' });
    }

    // Basic URL parsing validation
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ success: false, error: 'Please enter a valid URL (include http:// or https://)' });
    }

    if (!name) {
      name = getHostname(url);
    }

    // Create entry in MongoDB
    const website = await Website.create({
      userId: req.user.id,
      name,
      url,
      status: 'crawling'
    });

    // Run training pipeline in background
    runTrainingPipeline(website._id, url, name);

    res.status(202).json({
      success: true,
      message: 'Website training process started in background',
      website
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Get website status & metrics
 * @route   GET /api/websites/status/:id
 * @access  Private
 */
const getWebsiteStatus = async (req, res) => {
  try {
    const website = await Website.findOne({ _id: req.params.id, userId: req.user.id });

    if (!website) {
      return res.status(404).json({ success: false, error: 'Website not found' });
    }

    res.json({
      success: true,
      website
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Get all trained/training websites for the user
 * @route   GET /api/websites
 * @access  Private
 */
const listWebsites = async (req, res) => {
  try {
    const websites = await Website.find({ userId: req.user.id }).sort('-createdAt');
    res.json({
      success: true,
      count: websites.length,
      websites
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Retrain website
 * @route   POST /api/websites/retrain/:id
 * @access  Private
 */
const retrainWebsite = async (req, res) => {
  try {
    const website = await Website.findOne({ _id: req.params.id, userId: req.user.id });

    if (!website) {
      return res.status(404).json({ success: false, error: 'Website not found' });
    }

    // Cleanup previous indexes and pages
    await vectorStoreService.deleteCollection(website._id);
    await CrawledPage.deleteMany({ websiteId: website._id });

    // Reset status
    website.status = 'crawling';
    website.totalPages = 0;
    website.totalChunks = 0;
    website.summary = { executiveSummary: '', mainTopics: [], keyServices: [], importantInfo: [], technologies: [], keywords: [], category: 'Uncategorized', contactInfo: [], socialLinks: [], aiConfidenceScore: 0 };
    await website.save();

    // Trigger background pipeline
    runTrainingPipeline(website._id, website.url, website.name);

    res.json({
      success: true,
      message: 'Website retraining started in background',
      website
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Delete a website and all associated documents
 * @route   DELETE /api/websites/:id
 * @access  Private
 */
const deleteWebsite = async (req, res) => {
  try {
    const website = await Website.findOne({ _id: req.params.id, userId: req.user.id });

    if (!website) {
      return res.status(404).json({ success: false, error: 'Website not found' });
    }

    // Delete ChromaDB Collection and MongoDB Chunks
    await vectorStoreService.deleteCollection(website._id);

    // Delete Crawled Pages
    await CrawledPage.deleteMany({ websiteId: website._id });

    // Delete User conversations and messages
    const conversations = await Conversation.find({ websiteId: website._id }).select('_id');
    const convIds = conversations.map(c => c._id);
    
    await Message.deleteMany({ conversationId: { $in: convIds } });
    await Conversation.deleteMany({ websiteId: website._id });

    // Delete Documentation
    await Documentation.deleteOne({ websiteId: website._id });

    // Delete website itself
    await website.deleteOne();

    res.json({
      success: true,
      message: 'Website and all associated documents deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Get detailed debug status for website training
 * @route   GET /api/websites/debug/training/:id
 * @access  Private
 */
const getDebugTraining = async (req, res) => {
  try {
    const website = await Website.findOne({ _id: req.params.id, userId: req.user.id });

    if (!website) {
      return res.status(404).json({ success: false, error: 'Website not found' });
    }

    res.json({
      currentStage: website.currentStage,
      pagesFound: website.pagesFound,
      pagesProcessed: website.pagesProcessed,
      chunksGenerated: website.totalChunks,
      embeddingsGenerated: website.embeddingsGenerated,
      vectorStatus: website.vectorStatus,
      currentError: website.currentError,
      logs: website.logs
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  trainWebsite,
  getWebsiteStatus,
  listWebsites,
  retrainWebsite,
  deleteWebsite,
  getDebugTraining
};
