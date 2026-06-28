const cheerio = require('cheerio');
const { URL } = require('url');
const axios = require('axios');

/**
 * Standard sleep utility
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Normalize and filter URLs to ensure they are on the same domain and not files
 */
function cleanUrl(urlStr, baseUrlStr) {
  try {
    if (!urlStr || urlStr.startsWith('mailto:') || urlStr.startsWith('tel:') || urlStr.startsWith('javascript:')) return null;

    const baseObj = new URL(baseUrlStr);
    const urlObj = new URL(urlStr, baseUrlStr);

    // Keep same domain only
    if (urlObj.hostname !== baseObj.hostname) return null;

    // Remove hash/anchor
    urlObj.hash = '';

    const ext = urlObj.pathname.split('.').pop().toLowerCase();
    const disallowedExts = ['png', 'jpg', 'jpeg', 'gif', 'pdf', 'zip', 'tar', 'gz', 'mp4', 'mp3', 'docx', 'xlsx', 'css', 'js', 'xml', 'csv'];
    if (urlObj.pathname.includes('.') && disallowedExts.includes(ext)) {
      return null;
    }

    return urlObj.toString();
  } catch (e) {
    return null;
  }
}

/**
 * Fetch HTML using axios
 */
async function fetchStaticHtml(url) {
  try {
    const res = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'WebMindBot/1.0 (AI Research Crawler)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      responseType: 'text'
    });
    return typeof res.data === 'string' ? res.data : null;
  } catch (err) {
    console.error(`Static fetch failed for ${url}: ${err.message}`);
    return null;
  }
}

/**
 * Fetch HTML using Puppeteer for JS-heavy sites
 */
async function fetchDynamicHtml(url) {
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch (e) {
    console.warn('Puppeteer is not available or failed to load. Skipping Puppeteer fetch.');
    return null;
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();
    await page.setUserAgent('WebMindBot/1.0 (AI Research Crawler)');
    // Set 15s timeout
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
    const content = await page.content();
    await browser.close();
    return content;
  } catch (err) {
    if (browser) {
      try { await browser.close(); } catch (e) {}
    }
    console.error(`Puppeteer fetch failed for ${url}: ${err.message}`);
    return null;
  }
}

/**
 * Clean text by stripping scripts, styles, and other boilerplate elements
 */
function cleanText(html) {
  const $ = cheerio.load(html);
  
  // Remove navigation, header, footer, script, and style blocks
  $('script, style, nav, footer, header, noscript, iframe, link, svg, symbol, path').remove();
  
  // Also try to find common sidebar/nav classes and IDs and remove them
  $('.navigation, .sidebar, #sidebar, .menu, #menu, .footer, #footer, .header, #header, .ads, .advertisement').remove();
  
  // Get text from body or whole doc
  const rawText = $('body').text() || $.text();
  
  // Clean whitespace and double newlines
  return rawText
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();
}

/**
 * Crawl Website Entry Point
 * Runs recursively up to maxPages.
 */
async function crawlWebsite(startUrl, maxPages = 50, updateProgressCallback = null) {
  const visited = new Set();
  const queue = [startUrl];
  const pagesData = [];

  const updateProgress = (log, currentPercent) => {
    if (updateProgressCallback) {
      updateProgressCallback({
        log,
        progress: Math.min(100, Math.round(currentPercent)),
        pagesCount: pagesData.length
      });
    }
  };

  updateProgress(`Starting crawl on ${startUrl}...`, 5);

  while (queue.length > 0 && pagesData.length < maxPages) {
    const currentUrl = queue.shift();
    if (visited.has(currentUrl)) continue;

    visited.add(currentUrl);
    updateProgress(`Fetching page: ${currentUrl}`, (pagesData.length / maxPages) * 80 + 5);

    try {
      let html = await fetchStaticHtml(currentUrl);
      let isDynamic = false;

      // Check if Cheerio failed or returned empty content, and try Puppeteer
      if (!html || html.length < 500) {
        updateProgress(`Static fetch insufficient for ${currentUrl}. Trying dynamic fallback...`, (pagesData.length / maxPages) * 80 + 5);
        html = await fetchDynamicHtml(currentUrl);
        isDynamic = true;
      }

      if (!html) {
        updateProgress(`Skipping ${currentUrl} (unable to retrieve content)`, (pagesData.length / maxPages) * 80 + 5);
        continue;
      }

      const $ = cheerio.load(html);
      
      // Extract metadata
      const title = $('title').text().trim() || 'No Title';
      const description = $('meta[name="description"]').attr('content')?.trim() || '';
      const bodyText = cleanText(html);

      if (bodyText.length < 100) {
        updateProgress(`Skipping ${currentUrl} (content too short: ${bodyText.length} chars)`, (pagesData.length / maxPages) * 80 + 5);
        continue;
      }

      pagesData.push({
        url: currentUrl,
        title,
        description,
        content: bodyText,
        contentLength: bodyText.length,
        timestamp: new Date()
      });

      updateProgress(`Successfully crawled: "${title}" (${bodyText.length} characters)`, (pagesData.length / maxPages) * 80 + 5);

      // Find links and add to queue
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        const absoluteUrl = cleanUrl(href, currentUrl);
        if (absoluteUrl && !visited.has(absoluteUrl) && !queue.includes(absoluteUrl)) {
          queue.push(absoluteUrl);
        }
      });
    } catch (e) {
      updateProgress(`Error crawling ${currentUrl}: ${e.message}`, (pagesData.length / maxPages) * 80 + 5);
    }

    // Polite delay to avoid hammering servers
    await sleep(200);
  }

  updateProgress(`Crawl completed. Found ${pagesData.length} pages total.`, 85);
  return pagesData;
}

module.exports = {
  crawlWebsite
};
