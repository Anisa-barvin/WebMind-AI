const { chunkText } = require('../services/embeddingService');
const { crawlWebsite } = require('../services/crawlerService');

// Simple cosine similarity calculator for vector assertions
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function runTests() {
  console.log('==================================================');
  console.log('        WEBMIND AI SERVICES VERIFICATION TEST       ');
  console.log('==================================================\n');

  let testsPassed = 0;
  let testsFailed = 0;

  // Assert Helper
  const assert = (condition, description) => {
    if (condition) {
      console.log(`[PASS] ${description}`);
      testsPassed++;
    } else {
      console.log(`[FAIL] ${description}`);
      testsFailed++;
    }
  };

  // Test 1: Chunking Splitting
  console.log('--- Test 1: Semantic Chunking Splitter ---');
  try {
    const text = 'WebMind AI is a full-stack platform. It crawls relative html files, builds embeddings and indexes vectors in database. It also handles chat conversations with grounding context and citations.';
    const chunks = chunkText(text, 50, 10);
    assert(chunks.length > 0, `Text chunker split content successfully (Output: ${chunks.length} chunks)`);
    assert(chunks.every(c => c.length > 0), 'All chunks possess content length');
  } catch (e) {
    assert(false, `Chunking failed: ${e.message}`);
  }

  // Test 2: Cosine Similarity Matching
  console.log('\n--- Test 2: Cosine Vector Similarity ---');
  try {
    const vecA = [1.0, 0.0, 0.5];
    const vecB = [1.0, 0.0, 0.5];
    const vecC = [0.0, 1.0, 0.0];

    const simSelf = cosineSimilarity(vecA, vecB);
    const simDiff = cosineSimilarity(vecA, vecC);

    assert(Math.abs(simSelf - 1.0) < 0.0001, `Self-similarity matches perfectly: ${simSelf}`);
    assert(simDiff === 0, `Orthogonal vector similarity matches 0: ${simDiff}`);
  } catch (e) {
    assert(false, `Similarity calculation failed: ${e.message}`);
  }

  // Test 3: Static crawler request
  console.log('\n--- Test 3: Cheerio Scraping Engine ---');
  try {
    console.log('Running static scraper on test endpoint: https://example.com...');
    const crawledData = await crawlWebsite('https://example.com', 1);
    
    assert(crawledData.length > 0, `Scraper parsed target URL (Output pages: ${crawledData.length})`);
    if (crawledData.length > 0) {
      const page = crawledData[0];
      assert(page.url === 'https://example.com', `Scraped page matches target URL`);
      assert(page.title.toLowerCase().includes('example domain'), `Scraped page title parsed correctly: "${page.title}"`);
      assert(page.content.length > 100, `Text body extracted: ${page.content.length} characters`);
    }
  } catch (e) {
    assert(false, `Crawler failed: ${e.message}`);
  }

  console.log('\n==================================================');
  console.log(`TEST SUMMARY: ${testsPassed} Passed, ${testsFailed} Failed`);
  console.log('==================================================');
  
  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTests();
