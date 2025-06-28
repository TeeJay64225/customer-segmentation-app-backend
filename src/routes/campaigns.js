const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   GET /api/campaigns
// @desc    Get all campaigns
// @access  Private
router.get('/', async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Campaigns endpoint working',
      data: { campaigns: [] }
    });
  } catch (error) {
    console.error('❌ Get campaigns error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;