const mongoose = require('mongoose');

const DocumentationSchema = new mongoose.Schema({
  websiteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  executiveSummary: { type: String, default: '' },
  websiteOverview: { type: String, default: '' },
  mainTopics: { type: [String], default: [] },
  keyServices: { type: [String], default: [] },
  technologies: { type: [String], default: [] },
  importantPages: [{
    title: { type: String },
    url: { type: String },
    description: { type: String }
  }],
  contactInfo: { type: [String], default: [] },
  faq: [{
    question: { type: String },
    answer: { type: String }
  }],
  keywords: { type: [String], default: [] },
  aiInsights: { type: [String], default: [] },
  websiteStats: {
    totalPages: { type: Number, default: 0 },
    totalChunks: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Documentation', DocumentationSchema);
