const express = require('express');
const router = express.Router();
const {
  trainWebsite,
  getWebsiteStatus,
  listWebsites,
  retrainWebsite,
  deleteWebsite,
  getDebugTraining
} = require('../controllers/websiteController');
const { protect } = require('../middleware/authMiddleware');

router.post('/train', protect, trainWebsite);
router.get('/status/:id', protect, getWebsiteStatus);
router.get('/debug/training/:id', protect, getDebugTraining);
router.get('/', protect, listWebsites);
router.post('/retrain/:id', protect, retrainWebsite);
router.delete('/:id', protect, deleteWebsite);

module.exports = router;
