const Documentation = require('../models/Documentation');
const Website = require('../models/Website');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const documentationService = require('../services/documentationService');

/**
 * @desc    Get website documentation
 * @route   GET /api/documentation/:websiteId
 * @access  Private
 */
const getDocumentation = async (req, res) => {
  try {
    const doc = await Documentation.findOne({ websiteId: req.params.websiteId, userId: req.user.id });
    
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Documentation not found' });
    }
    
    res.json({ success: true, documentation: doc });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Export documentation
 * @route   GET /api/documentation/export/:websiteId/:format
 * @access  Private
 */
const exportDocumentation = async (req, res) => {
  try {
    const { websiteId, format } = req.params;
    const doc = await Documentation.findOne({ websiteId, userId: req.user.id });
    const website = await Website.findOne({ _id: websiteId, userId: req.user.id });

    if (!doc || !website) {
      return res.status(404).json({ success: false, error: 'Documentation or website not found' });
    }

    let buffer;
    let contentType;
    let extension = format.toLowerCase();

    switch(extension) {
      case 'pdf':
        buffer = await documentationService.generatePDF(doc, website);
        contentType = 'application/pdf';
        break;
      case 'docx':
        buffer = await documentationService.generateDOCX(doc, website);
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case 'md':
      case 'markdown':
        buffer = documentationService.generateMarkdown(doc, website);
        contentType = 'text/markdown';
        extension = 'md';
        break;
      case 'txt':
        buffer = documentationService.generateTXT(doc, website);
        contentType = 'text/plain';
        break;
      default:
        return res.status(400).json({ success: false, error: 'Unsupported format' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${website.name.replace(/\s+/g, '_')}_Documentation.${extension}"`);
    res.setHeader('Content-Type', contentType);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Export chat conversation
 * @route   GET /api/documentation/export-chat/:conversationId/:format
 * @access  Private
 */
const exportChat = async (req, res) => {
  try {
    const { conversationId, format } = req.params;
    
    const conversation = await Conversation.findOne({ _id: conversationId, userId: req.user.id }).populate('websiteId');
    if (!conversation) return res.status(404).json({ success: false, error: 'Conversation not found' });
    
    const website = conversation.websiteId;
    const messages = await Message.find({ conversationId }).sort('createdAt');

    let buffer;
    let contentType;
    let extension = format.toLowerCase();

    // Simplified to PDF and TXT for chat for now, easily extendable
    if (extension === 'pdf') {
      buffer = await documentationService.generateChatPDF(messages, website);
      contentType = 'application/pdf';
    } else {
      buffer = documentationService.generateChatTXT(messages, website);
      contentType = 'text/plain';
      extension = 'txt';
    }

    res.setHeader('Content-Disposition', `attachment; filename="${website.name.replace(/\s+/g, '_')}_Chat.${extension}"`);
    res.setHeader('Content-Type', contentType);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Export training report
 * @route   GET /api/documentation/export-report/:websiteId
 * @access  Private
 */
const exportTrainingReport = async (req, res) => {
  try {
    const website = await Website.findOne({ _id: req.params.websiteId, userId: req.user.id });
    if (!website) return res.status(404).json({ success: false, error: 'Website not found' });

    const buffer = await documentationService.generateReportPDF(website);
    
    res.setHeader('Content-Disposition', `attachment; filename="${website.name.replace(/\s+/g, '_')}_Training_Report.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getDocumentation,
  exportDocumentation,
  exportChat,
  exportTrainingReport
};
