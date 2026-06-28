const mongoose = require('mongoose');
const Website = require('../models/Website');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

/**
 * @desc    Get dashboard analytics metrics and charts data
 * @route   GET /api/analytics
 * @access  Private
 */
const getAnalyticsData = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);

    // 1. Gather Top level statistics
    const totalWebsites = await Website.countDocuments({ userId: req.user.id });
    const totalConversations = await Conversation.countDocuments({ userId: req.user.id });

    const webStats = await Website.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: null,
          totalPages: { $sum: '$totalPages' },
          totalChunks: { $sum: '$totalChunks' }
        }
      }
    ]);

    const totalPages = webStats.length > 0 ? webStats[0].totalPages : 0;
    const totalChunks = webStats.length > 0 ? webStats[0].totalChunks : 0;

    // Count user questions (messages sent by user)
    const userConversations = await Conversation.find({ userId: req.user.id }).select('_id');
    const conversationIds = userConversations.map(c => c._id);
    
    const totalQuestions = await Message.countDocuments({
      conversationId: { $in: conversationIds },
      sender: 'user'
    });

    // 2. Questions per day aggregation (last 7 days)
    const questionsPerDay = await Message.aggregate([
      {
        $match: {
          conversationId: { $in: conversationIds },
          sender: 'user'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          questions: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 7 }
    ]);

    // Format questions per day response
    const questionsChartData = questionsPerDay.map(item => ({
      date: item._id,
      questions: item.questions
    }));

    // 3. Website-wise distribution chart data (pages per site)
    const websitesList = await Website.find({ userId: req.user.id })
      .select('name totalPages totalChunks status')
      .sort('-totalPages')
      .limit(5);

    const websitesChartData = websitesList.map(site => ({
      name: site.name,
      pages: site.totalPages,
      chunks: site.totalChunks
    }));

    // 4. Response speed (simulated distribution for charts)
    const responseTimesData = [
      { name: 'Crawler Match', time: 1.2 },
      { name: 'Embed Query', time: 0.4 },
      { name: 'Gemini Generative', time: 1.8 },
      { name: 'SSE Buffer', time: 0.1 }
    ];

    res.json({
      success: true,
      summary: {
        totalWebsites,
        totalConversations,
        totalPages,
        totalChunks,
        totalQuestions
      },
      charts: {
        questionsPerDay: questionsChartData,
        websitesDistribution: websitesChartData,
        responseTimes: responseTimesData
      }
    });
  } catch (error) {
    console.error(`Analytics aggregate error: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAnalyticsData
};
