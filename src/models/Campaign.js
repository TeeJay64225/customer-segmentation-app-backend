const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['email', 'sms', 'in_app', 'push'],
    required: true
  },
  targetSegments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Segment'
  }],
  content: {
    subject: String,
    message: String,
    htmlContent: String,
    imageUrl: String,
    ctaText: String,
    ctaUrl: String
  },
  promotion: {
    type: {
      type: String,
      enum: ['discount', 'coupon', 'free_shipping', 'bogo']
    },
    value: Number,
    code: String,
    expiryDate: Date
  },
  schedule: {
    startDate: Date,
    endDate: Date,
    frequency: {
      type: String,
      enum: ['once', 'daily', 'weekly', 'monthly']
    },
    isImmediate: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'paused', 'completed'],
    default: 'draft'
  },
  metrics: {
    sent: {
      type: Number,
      default: 0
    },
    delivered: {
      type: Number,
      default: 0
    },
    opened: {
      type: Number,
      default: 0
    },
    clicked: {
      type: Number,
      default: 0
    },
    converted: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Campaign', campaignSchema);