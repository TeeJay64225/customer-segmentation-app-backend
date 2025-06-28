const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  criteria: {
    totalSpent: {
      min: Number,
      max: Number
    },
    frequency: {
      min: Number,
      max: Number
    },
    recency: {
      days: Number
    },
    categories: [String],
    customRules: [{
      field: String,
      operator: String,
      value: mongoose.Schema.Types.Mixed
    }]
  },
  users: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    score: Number,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  aiModel: {
    algorithm: {
      type: String,
      enum: ['kmeans', 'rfm', 'custom'],
      default: 'rfm'
    },
    parameters: mongoose.Schema.Types.Mixed,
    lastTrained: Date,
    accuracy: Number
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Segment', segmentSchema);