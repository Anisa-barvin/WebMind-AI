/**
 * Simulate the FULL pipeline end-to-end with a real URL
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const crawlerService = require('../services/crawlerService');
const embeddingService = require('../services/embeddingService');

async function simulatePipeline() {
  const url = 'https://example.com';
  console.log('=== Full Pipeline Simulation ===');
  console.log('Target URL:', url);
  console.log('');

  // Stage 1: Crawl
  console.log('[STAGE 1] Crawling...');
  let pages;
  try {
    pages = await crawlerService.crawlWebsite(url, 5, (info) => {
      console.log(`  ${info.progress}% - ${info.log}`);
    });
    console.log(`[STAGE 1 OK] Crawled ${pages.length} pages`);
  } catch (e) {
    console.error(`[STAGE 1 FAIL] ${e.message}`);
    console.error(e.stack);
    return;
  }

  if (!pages || pages.length === 0) {
    console.error('[STAGE 1 FAIL] No pages returned');
    return;
  }

  // Stage 2: Chunk
  console.log('\n[STAGE 2] Chunking...');
  const allChunks = [];
  try {
    for (const page of pages) {
      const textChunks = embeddingService.chunkText(page.content, 800, 150);
      console.log(`  Page "${page.title}": content=${page.content.length} chars -> ${textChunks.length} chunks`);
      for (let i = 0; i < textChunks.length; i++) {
        allChunks.push({
          text: textChunks[i],
          sourceUrl: page.url,
          chunkNumber: i + 1
        });
      }
    }
    console.log(`[STAGE 2 OK] Total chunks: ${allChunks.length}`);
  } catch (e) {
    console.error(`[STAGE 2 FAIL] ${e.message}`);
    console.error(e.stack);
    return;
  }

  // Stage 3: Embed
  console.log('\n[STAGE 3] Generating embeddings...');
  try {
    for (let i = 0; i < Math.min(allChunks.length, 2); i++) {
      console.log(`  Embedding chunk ${i + 1}/${allChunks.length}: "${allChunks[i].text.substring(0, 40)}..."`);
      const embedding = await embeddingService.getEmbedding(allChunks[i].text);
      allChunks[i].embedding = embedding;
      console.log(`  [OK] Got ${embedding.length}-dim vector (${process.env.GEMINI_API_KEY ? 'real' : 'mock'})`);
    }
    console.log(`[STAGE 3 OK] Embeddings generated`);
  } catch (e) {
    console.error(`[STAGE 3 FAIL] ${e.message}`);
    console.error(e.stack);
    return;
  }

  console.log('\n=== Pipeline Simulation Complete - All stages passed ===');
}

simulatePipeline().catch(e => {
  console.error('FATAL:', e.message);
  console.error(e.stack);
}).finally(() => setTimeout(() => process.exit(0), 500));
