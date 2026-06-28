const mongoose = require('mongoose');

const ChunkSchema = new mongoose.Schema({
  websiteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: true
  },
  pageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CrawledPage',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  sourceUrl: {
    type: String,
    required: true
  },
  chunkNumber: {
    type: Number,
    required: true
  },
  embedding: {
    type: [Number],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index to search chunks by website faster
ChunkSchema.index({ websiteId: 1 });

module.exports = mongoose.model('Chunk', ChunkSchema);
