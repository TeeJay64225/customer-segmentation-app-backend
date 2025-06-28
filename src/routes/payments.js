const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   GET /api/payments/history
// @desc    Get payment history
// @access  Private
router.get('/history', async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Payment history endpoint working',
      data: { payments: [] }
    });
  } catch (error) {
    console.error('❌ Get payment history error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;