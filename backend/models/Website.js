const mongoose = require('mongoose');

const WebsiteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add website name']
  },
  url: {
    type: String,
    required: [true, 'Please add website URL']
  },
  status: {
    type: String,
    enum: ['init', 'crawling', 'indexing', 'embedding', 'saving', 'ready', 'failed'],
    default: 'init'
  },
  currentStage: {
    type: String,
    default: 'init'
  },
  pagesFound: {
    type: Number,
    default: 0
  },
  pagesProcessed: {
    type: Number,
    default: 0
  },
  embeddingsGenerated: {
    type: Number,
    default: 0
  },
  vectorStatus: {
    type: String,
    default: ''
  },
  currentError: {
    type: String,
    default: ''
  },
  logs: [{
    timestamp: { type: Date, default: Date.now },
    message: String,
    level: { type: String, enum: ['info', 'warn', 'error', 'success'], default: 'info' }
  }],
  totalPages: {
    type: Number,
    default: 0
  },
  totalChunks: {
    type: Number,
    default: 0
  },
  summary: {
    executiveSummary: { type: String, default: '' },
    mainTopics: { type: [String], default: [] },
    keyServices: { type: [String], default: [] },
    importantInfo: { type: [String], default: [] },
    technologies: { type: [String], default: [] },
    keywords: { type: [String], default: [] },
    category: { type: String, default: 'Uncategorized' },
    contactInfo: { type: [String], default: [] },
    socialLinks: { type: [String], default: [] },
    aiConfidenceScore: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Helper to add logs easily
WebsiteSchema.methods.addLog = async function(message, level = 'info') {
  const logEntry = { message, level, timestamp: new Date() };
  await this.model('Website').updateOne(
    { _id: this._id },
    { $push: { logs: logEntry } }
  );
  // Also push to current instance so memory is synced if accessed again
  this.logs.push(logEntry);
  return true;
};

module.exports = mongoose.model('Website', WebsiteSchema);
