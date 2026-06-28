/**
 * Simulate the pipeline as websiteController runs it (with MongoDB)
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function testWithMongo() {
  console.log('=== Full Pipeline with MongoDB ===\n');

  // Connect to MongoDB
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[OK] MongoDB connected');
  } catch (e) {
    console.error('[FAIL] MongoDB:', e.message);
    process.exit(1);
  }

  const Website = require('../models/Website');
  const CrawledPage = require('../models/CrawledPage');
  const Chunk = require('../models/Chunk');
  const crawlerService = require('../services/crawlerService');
  const embeddingService = require('../services/embeddingService');
  const vectorStoreService = require('../services/vectorStoreService');
  const geminiService = require('../services/geminiService');

  const url = 'https://example.com';
  const name = 'example.com';

  // Create test website entry
  let website;
  try {
    website = await Website.create({
      userId: new mongoose.Types.ObjectId(),
      name,
      url,
      status: 'crawling'
    });
    console.log('[OK] Created Website doc:', website._id);
  } catch (e) {
    console.error('[FAIL] Website.create:', e.message);
    console.error(e.stack);
    await mongoose.disconnect();
    process.exit(1);
  }

  // Now run EXACTLY the same code as runTrainingPipeline
  try {
    console.log('\n[STAGE 1] Crawling...');
    const pages = await crawlerService.crawlWebsite(url, 50, async (progressInfo) => {
      console.log(`  ${progressInfo.progress}% - ${progressInfo.log}`);
    });

    if (!pages || pages.length === 0) {
      throw new Error('No pages could be crawled from the provided URL.');
    }
    console.log(`[OK] Got ${pages.length} pages`);

    // Update status to indexing
    website.status = 'indexing';
    website.totalPages = pages.length;
    await website.save();
    console.log('[OK] Status -> indexing');

    console.log('\n[STAGE 2] Chunk & Embed...');
    const allChunks = [];
    const savedPages = [];

    for (let page of pages) {
      console.log(`  Processing page: "${page.title}" (${page.contentLength} chars)`);

      // Save CrawledPage to MongoDB
      const crawledPage = await CrawledPage.create({
        websiteId: website._id,
        url: page.url,
        title: page.title,
        description: page.description,
        content: page.content,
        contentLength: page.contentLength
      });
      savedPages.push(crawledPage);
      console.log(`  [OK] Saved CrawledPage: ${crawledPage._id}`);

      // Create chunks
      const textChunks = embeddingService.chunkText(page.content, 800, 150);
      console.log(`  [OK] Created ${textChunks.length} text chunks`);

      for (let i = 0; i < textChunks.length; i++) {
        const text = textChunks[i];

        // Generate embedding vector
        console.log(`  Generating embedding for chunk ${i + 1}...`);
        const embedding = await embeddingService.getEmbedding(text);
        console.log(`  [OK] Got ${embedding.length}-dim vector`);

        allChunks.push({
          websiteId: website._id,
          pageId: crawledPage._id,
          text,
          sourceUrl: page.url,
          chunkNumber: i + 1,
          embedding
        });
      }
    }

    console.log(`\n[STAGE 3] Storing ${allChunks.length} vectors...`);
    await vectorStoreService.addChunks(website._id, allChunks);
    console.log('[OK] Vectors stored');

    console.log('\n[STAGE 4] Generating summary...');
    const pageTexts = pages.slice(0, 3).map(p => `Page Title: ${p.title}\nPage Text: ${p.content}`);
    const summary = await geminiService.generateWebsiteSummary(name, pageTexts);
    console.log('[OK] Summary:', JSON.stringify(summary).substring(0, 200));

    // 5. Wrap up
    website.status = 'ready';
    website.totalChunks = allChunks.length;
    website.summary = {
      executiveSummary: summary.executiveSummary || 'No executive summary generated.',
      mainTopics: summary.mainTopics || [],
      keyServices: summary.keyServices || [],
      importantInfo: summary.importantInfo || []
    };
    await website.save();

    console.log('\n=== Pipeline completed successfully! ===');
    console.log('Website status:', website.status);
    console.log('Total pages:', website.totalPages);
    console.log('Total chunks:', website.totalChunks);
  } catch (error) {
    console.error(`\n=== PIPELINE FAILED ===`);
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    await Website.findByIdAndUpdate(website._id, { status: 'failed' });
  }

  // Cleanup test data
  try {
    await CrawledPage.deleteMany({ websiteId: website._id });
    await Chunk.deleteMany({ websiteId: website._id });
    await Website.findByIdAndDelete(website._id);
    console.log('\n[CLEANUP] Test data removed');
  } catch (e) { /* ignore */ }

  await mongoose.disconnect();
  process.exit(0);
}

testWithMongo().catch(e => {
  console.error('Script crashed:', e.message, e.stack);
  process.exit(1);
});
