const { pipeline } = require('@xenova/transformers');

let extractorPipeline = null;
let extractorPromise = null;

const getExtractor = async () => {
  if (!extractorPromise) {
    extractorPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  if (!extractorPipeline) {
    extractorPipeline = await extractorPromise;
  }
  return extractorPipeline;
};

// Start initialization in the background immediately
getExtractor().catch(err => console.error("Failed to init transformer:", err));

/**
 * Split text into semantic chunks with overlap
 */
function chunkText(text, chunkSize = 1000, chunkOverlap = 200) {
  if (!text) return [];
  const chunks = [];
  let startIndex = 0;

  // Replace double spaces and clean text
  const clean = text.replace(/\s+/g, ' ').trim();

  while (startIndex < clean.length) {
    let endIndex = startIndex + chunkSize;

    // Try to break at a space near the boundary
    if (endIndex < clean.length) {
      const lastSpace = clean.lastIndexOf(' ', endIndex);
      // Ensure we don't backtrack too far
      if (lastSpace > startIndex + (chunkSize * 0.75)) {
        endIndex = lastSpace;
      }
    }

    const chunk = clean.slice(startIndex, endIndex).trim();
    if (chunk.length > 30) {
      chunks.push(chunk);
    }

    // Step forward
    startIndex = endIndex - chunkOverlap;
    
    // Prevent infinite loop if we don't progress
    if (startIndex >= clean.length) break;
    if (endIndex <= startIndex) {
      startIndex = endIndex + 1;
    }
  }

  return chunks;
}

/**
 * Execute a promise with a timeout
 */
const withTimeout = (promise, ms) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Operation timed out after ${ms} ms`));
    }, ms);
  });
  return Promise.race([
    promise,
    timeoutPromise
  ]).finally(() => clearTimeout(timeoutId));
};

/**
 * Generate embedding vector using local model (all-MiniLM-L6-v2)
 */
async function getEmbedding(text, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const extractor = await getExtractor();
      
      // Use 60 second timeout
      const result = await withTimeout(
        extractor(text, { pooling: 'mean', normalize: true }), 
        60000
      );
      
      if (result && result.data) {
        const values = Array.from(result.data);
        return { success: true, values };
      } else {
        throw new Error('Invalid embedding response from transformers');
      }
    } catch (error) {
      console.error(`Error generating embedding (Attempt ${attempt}/${retries}): ${error.message}`);
      
      if (attempt === retries) {
        console.warn('Returning failure after max retries.');
        return { success: false, error: error.message };
      }
      // Wait before retry
      await new Promise(res => setTimeout(res, attempt * 1000));
    }
  }
}

module.exports = {
  chunkText,
  getEmbedding
};
