/**
 * Diagnose the training pipeline - find the exact failure point
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function diagnose() {
  console.log('=== WebMind Pipeline Diagnostics ===\n');

  // 1. Check Node version
  console.log('[ENV] Node.js version:', process.version);
  console.log('[ENV] MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'MISSING');
  console.log('[ENV] GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? `SET (${process.env.GEMINI_API_KEY.length} chars)` : 'EMPTY/MISSING');
  console.log('[ENV] CHROMA_URL:', process.env.CHROMA_URL || 'NOT SET');
  console.log('');

  // 2. Test cheerio
  console.log('--- Cheerio Test ---');
  try {
    const cheerio = require('cheerio');
    const version = require('cheerio/package.json').version;
    console.log('[OK] cheerio version:', version);
    
    const html = '<html><body><p>Hello World</p><script>var x=1;</script><nav>Nav content</nav></body></html>';
    const $ = cheerio.load(html);
    console.log('[OK] cheerio.load() works');
    
    const scriptCount = $('script').length;
    console.log('[OK] $("script") found:', scriptCount, 'elements');
    
    $('script, nav').remove();
    const text = $('body').text().trim();
    console.log('[OK] Text after cleanup:', JSON.stringify(text));
  } catch (e) {
    console.error('[FAIL] cheerio:', e.message);
    console.error(e.stack);
  }
  console.log('');

  // 3. Test native fetch
  console.log('--- Fetch Test ---');
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const res = await fetch('https://example.com', {
      signal: controller.signal,
      headers: { 'User-Agent': 'WebMindBot/1.0' }
    });
    clearTimeout(timeoutId);
    const text = await res.text();
    console.log('[OK] fetch status:', res.status, '| body length:', text.length);
  } catch (e) {
    console.error('[FAIL] native fetch:', e.message);
    console.error('[INFO] This is likely the ROOT CAUSE - native fetch broken on Node', process.version);
    console.error(e.stack);
  }
  console.log('');

  // 4. Test crawlerService directly
  console.log('--- CrawlerService Test ---');
  try {
    const crawlerService = require('../services/crawlerService');
    console.log('[OK] crawlerService loaded');
    
    // Try crawling a simple page
    console.log('[INFO] Attempting to crawl https://example.com ...');
    const pages = await crawlerService.crawlWebsite('https://example.com', 2, (info) => {
      console.log(`  [PROGRESS] ${info.progress}% - ${info.log}`);
    });
    console.log('[RESULT] Pages crawled:', pages ? pages.length : 'null/undefined');
    if (pages && pages.length > 0) {
      console.log('[RESULT] First page title:', pages[0].title);
      console.log('[RESULT] First page content length:', pages[0].contentLength);
    }
  } catch (e) {
    console.error('[FAIL] crawlerService:', e.message);
    console.error(e.stack);
  }
  console.log('');

  // 5. Test embeddingService
  console.log('--- Embedding Service Test ---');
  try {
    const embeddingService = require('../services/embeddingService');
    console.log('[OK] embeddingService loaded');
    
    // Test chunking
    const chunks = embeddingService.chunkText('Hello world this is a test of the chunking system with some more text to make it long enough to pass the 30 character minimum filter.', 50, 10);
    console.log('[OK] chunkText produced', chunks.length, 'chunks');
    
    // Test embedding (only if API key is set)
    if (process.env.GEMINI_API_KEY) {
      console.log('[INFO] Testing Gemini embedding generation...');
      const emb = await embeddingService.getEmbedding('Test embedding');
      console.log('[OK] Embedding generated, dimensions:', emb.length);
    } else {
      console.log('[SKIP] No GEMINI_API_KEY, embedding test skipped (mock vectors will be used in dev)');
    }
  } catch (e) {
    console.error('[FAIL] embeddingService:', e.message);
    console.error(e.stack);
  }
  console.log('');

  console.log('=== Diagnostics Complete ===');
}

diagnose().catch(e => {
  console.error('Diagnostic script crashed:', e.message);
  console.error(e.stack);
}).finally(() => {
  // Don't let mongoose keep the process alive
  setTimeout(() => process.exit(0), 500);
});
