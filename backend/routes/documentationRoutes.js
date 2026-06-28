const express = require('express');
const router = express.Router();
const {
  getDocumentation,
  exportDocumentation,
  exportChat,
  exportTrainingReport
} = require('../controllers/documentationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/:websiteId', getDocumentation);
router.get('/export/:websiteId/:format', exportDocumentation);
router.get('/export-chat/:conversationId/:format', exportChat);
router.get('/export-report/:websiteId', exportTrainingReport);

module.exports = router;
