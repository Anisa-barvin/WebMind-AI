const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Website = require('../models/Website');
const Chunk = require('../models/Chunk');
const embeddingService = require('../services/embeddingService');
const vectorStoreService = require('../services/vectorStoreService');
const groqService = require('../services/groqService');

/**
 * @desc    Create a new conversation session
 * @route   POST /api/chat/conversations
 * @access  Private
 */
const createConversation = async (req, res) => {
  try {
    const { websiteId, title } = req.body;

    if (!websiteId) {
      return res.status(400).json({ success: false, error: 'Please provide website ID' });
    }

    const website = await Website.findOne({ _id: websiteId, userId: req.user.id });
    if (!website) {
      return res.status(404).json({ success: false, error: 'Website not found' });
    }

    const conversation = await Conversation.create({
      userId: req.user.id,
      websiteId,
      title: title || `Chat with ${website.name}`
    });

    res.status(201).json({
      success: true,
      conversation
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Get user's conversations list for a website
 * @route   GET /api/chat/conversations/:websiteId
 * @access  Private
 */
const listConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      userId: req.user.id,
      websiteId: req.params.websiteId
    }).sort('-updatedAt');

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Get chat message history for a conversation
 * @route   GET /api/chat/history/:conversationId
 * @access  Private
 */
const getConversationHistory = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      userId: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    const messages = await Message.find({ conversationId: conversation._id }).sort('createdAt');

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Send a message & trigger standard non-stream RAG workflow
 * @route   POST /api/chat/message
 * @access  Private
 */
const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;

    if (!conversationId || !text) {
      return res.status(400).json({ success: false, error: 'Please provide conversationId and message text' });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    // 1. Save user message
    const userMessage = await Message.create({
      conversationId: conversation._id,
      sender: 'user',
      text
    });

    // 2. Generate embedding for query
    const embedResult = await embeddingService.getEmbedding(text);
    if (!embedResult || !embedResult.success) {
      return res.status(500).json({ success: false, error: 'Failed to generate embedding for query' });
    }
    const queryEmbedding = embedResult.values;

    // 3. Search vector database for top chunks
    const matches = await vectorStoreService.querySimilarity(conversation.websiteId, queryEmbedding, 5);

    // 4. Call xAI to answer based on context
    const aiAnswer = await groqService.generateAnswer(text, matches);

    // Get source page details for citations (extract page titles and URLs)
    const sources = matches.map(m => ({
      title: m.text.substring(0, 50) + '...',
      url: m.sourceUrl,
      score: m.score
    }));

    // 5. Save AI message
    const aiMessage = await Message.create({
      conversationId: conversation._id,
      sender: 'ai',
      text: aiAnswer,
      sources
    });

    // Update conversation updatedAt
    conversation.updatedAt = Date.now();
    await conversation.save();

    res.json({
      success: true,
      userMessage,
      aiMessage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Send a message & stream RAG response using SSE (Server-Sent Events)
 * @route   GET /api/chat/stream
 * @access  Private (token passed in query params)
 */
const streamMessage = async (req, res) => {
  const { conversationId, text, token } = req.query;

  if (!conversationId || !text || !token) {
    return res.status(400).send('Missing query parameters (conversationId, text, token)');
  }

  // Set headers for Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let conversation;
  try {
    // Authenticate token (since SSE does not support standard auth headers natively in EventSource)
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    conversation = await Conversation.findOne({
      _id: conversationId,
      userId: decoded.id
    });
    
    if (!conversation) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: 'Conversation not found' })}\n\n`);
      return res.end();
    }
  } catch (err) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: 'Unauthorized token' })}\n\n`);
    return res.end();
  }

  try {
    // 1. Save user message
    await Message.create({
      conversationId: conversation._id,
      sender: 'user',
      text
    });

    // 2. Query embedding
    const embedResult = await embeddingService.getEmbedding(text);
    if (!embedResult || !embedResult.success) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: 'Failed to generate embedding for query' })}\n\n`);
      return res.end();
    }
    const queryEmbedding = embedResult.values;

    // 3. Search vector database for top chunks
    const matches = await vectorStoreService.querySimilarity(conversation.websiteId, queryEmbedding, 5);

    // 4. Send citations/sources event first
    const sources = matches.map(m => ({
      title: m.text.substring(0, 60).replace(/\n/g, ' ') + '...',
      url: m.sourceUrl,
      score: m.score
    }));
    
    res.write(`event: sources\ndata: ${JSON.stringify(sources)}\n\n`);

    // 5. Stream response content
    let fullResponseText = '';
    await groqService.generateAnswerStream(text, matches, (chunkText) => {
      fullResponseText += chunkText;
      // Send chunk
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    });

    // 6. Save AI message
    await Message.create({
      conversationId: conversation._id,
      sender: 'ai',
      text: fullResponseText,
      sources
    });

    // Update conversation timestamp
    conversation.updatedAt = Date.now();
    await conversation.save();

    // Signal stream completed
    res.write(`event: done\ndata: [DONE]\n\n`);
    res.end();
  } catch (error) {
    console.error(error);
    res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
};

module.exports = {
  createConversation,
  listConversations,
  getConversationHistory,
  sendMessage,
  streamMessage
};
