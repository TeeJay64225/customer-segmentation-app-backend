const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   GET /api/segmentation/analytics
// @desc    Get analytics data
// @access  Private
router.get('/analytics', async (req, res) => {
  try {
    // Mock analytics data for now
    const analytics = {
      overview: {
        totalUsers: 1250,
        totalPurchases: 3456,
        totalRevenue: 125000,
        averageOrderValue: 85.50
      },
      monthlyRevenue: [
        { _id: { month: 1 }, revenue: 15000, count: 120 },
        { _id: { month: 2 }, revenue: 18000, count: 145 },
        { _id: { month: 3 }, revenue: 22000, count: 180 },
        { _id: { month: 4 }, revenue: 25000, count: 200 },
        { _id: { month: 5 }, revenue: 28000, count: 220 },
        { _id: { month: 6 }, revenue: 32000, count: 250 }
      ],
      topCategories: [
        { _id: 'Electronics', revenue: 45000, count: 120 },
        { _id: 'Clothing', revenue: 32000, count: 200 },
        { _id: 'Books', revenue: 18000, count: 300 },
        { _id: 'Home & Garden', revenue: 22000, count: 150 },
        { _id: 'Sports', revenue: 15000, count: 100 }
      ]
    };

    res.status(200).json({
      success: true,
      message: 'Analytics retrieved successfully',
      data: { analytics }
    });
  } catch (error) {
    console.error('❌ Get analytics error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;