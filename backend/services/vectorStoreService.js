const { ChromaClient } = require('chromadb');
const Chunk = require('../models/Chunk');

// Initialize Chroma client
let chromaClient = null;
let isChromaEnabled = false;

const chromaUrl = process.env.CHROMA_URL || '';

const initChroma = async () => {
  if (!chromaUrl) {
    console.log('CHROMA_URL is not set. Using MongoDB vector fallback mode.');
    return false;
  }
  try {
    chromaClient = new ChromaClient({ path: chromaUrl });
    // Quick heartbeat check
    await chromaClient.heartbeat();
    console.log(`Successfully connected to ChromaDB at ${chromaUrl}`);
    isChromaEnabled = true;
    return true;
  } catch (error) {
    console.warn(`Could not connect to ChromaDB at ${chromaUrl}: ${error.message}. Defaulting to MongoDB vector fallback.`);
    isChromaEnabled = false;
    return false;
  }
};

// Fire connection check on load
initChroma();

/**
 * Clean collection name for Chroma requirements
 * (lowercase letters, numbers, underscores or hyphens, 3-63 chars)
 */
function getCollectionName(websiteId) {
  return `webmind_site_${websiteId.toString()}`.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
}

/**
 * Cosine similarity helper for MongoDB fallback
 */
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

/**
 * Add chunks to Chroma and MongoDB
 */
async function addChunks(websiteId, chunksData) {
  let vectorStatus = 'mongo';
  try {
    // Always save in MongoDB first (as absolute source and for fallback search)
    const savedChunks = await Chunk.insertMany(chunksData);
    console.log(`Saved ${savedChunks.length} chunks in MongoDB for site: ${websiteId}`);

    if (isChromaEnabled && chromaClient) {
      try {
        const collectionName = getCollectionName(websiteId);
        const collection = await chromaClient.getOrCreateCollection({ name: collectionName });

        const ids = savedChunks.map(c => c._id.toString());
        const embeddings = savedChunks.map(c => c.embedding);
        const metadatas = savedChunks.map(c => ({
          websiteId: websiteId.toString(),
          pageId: c.pageId.toString(),
          sourceUrl: c.sourceUrl,
          chunkNumber: c.chunkNumber
        }));
        const documents = savedChunks.map(c => c.text);

        await collection.add({
          ids,
          embeddings,
          metadatas,
          documents
        });
        console.log(`Successfully indexed ${savedChunks.length} chunks into Chroma collection "${collectionName}"`);
        vectorStatus = 'chroma';
      } catch (error) {
        console.error(`Failed to add chunks to Chroma: ${error.message}. Relying on MongoDB.`);
      }
    }
    return vectorStatus;
  } catch (error) {
    console.error(`Failed to add chunks to MongoDB: ${error.message}`);
    throw error;
  }
}

/**
 * Query top K matching chunks based on search vector
 */
async function querySimilarity(websiteId, queryEmbedding, limit = 5) {
  // If Chroma is enabled, query Chroma
  if (isChromaEnabled && chromaClient) {
    try {
      const collectionName = getCollectionName(websiteId);
      const collection = await chromaClient.getCollection({ name: collectionName });
      
      const results = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: limit
      });

      if (results && results.documents && results.documents[0]) {
        const matches = [];
        for (let i = 0; i < results.documents[0].length; i++) {
          matches.push({
            text: results.documents[0][i],
            sourceUrl: results.metadatas[0][i].sourceUrl,
            score: 1 - (results.distances ? results.distances[0][i] : 0.5) // Convert distance to relevance score
          });
        }
        return matches;
      }
    } catch (error) {
      console.warn(`Chroma query failed: ${error.message}. Falling back to MongoDB similarity search.`);
    }
  }

  // Fallback: Perform local cosine similarity on MongoDB chunks
  try {
    const allChunks = await Chunk.find({ websiteId }).select('text sourceUrl embedding');
    
    const scoredChunks = allChunks.map(chunk => {
      const score = cosineSimilarity(queryEmbedding, chunk.embedding);
      return {
        text: chunk.text,
        sourceUrl: chunk.sourceUrl,
        score
      };
    });

    // Sort by descending score and limit
    return scoredChunks
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.error(`MongoDB similarity search failed: ${error.message}`);
    return [];
  }
}

/**
 * Delete a website's collection from Chroma and chunks from MongoDB
 */
async function deleteCollection(websiteId) {
  // Delete from MongoDB
  await Chunk.deleteMany({ websiteId });

  if (isChromaEnabled && chromaClient) {
    try {
      const collectionName = getCollectionName(websiteId);
      await chromaClient.deleteCollection({ name: collectionName });
      console.log(`Deleted Chroma collection "${collectionName}"`);
    } catch (error) {
      console.warn(`Failed to delete collection from Chroma: ${error.message}`);
    }
  }
}

module.exports = {
  addChunks,
  querySimilarity,
  deleteCollection,
  initChroma
};
