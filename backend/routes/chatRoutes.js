const express = require('express');
const router = express.Router();
const {
  createConversation,
  listConversations,
  getConversationHistory,
  sendMessage,
  streamMessage
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/conversations', protect, createConversation);
router.get('/conversations/:websiteId', protect, listConversations);
router.get('/history/:conversationId', protect, getConversationHistory);
router.post('/message', protect, sendMessage);
router.get('/stream', streamMessage);

module.exports = router;
