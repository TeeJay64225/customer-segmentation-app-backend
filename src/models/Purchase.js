const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  customerId: {
    type: String,
    required: [true, 'Customer ID is required'],
    index: true
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  items: [{
    productId: {
      type: String,
      required: true
    },
    productName: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    sku: String,
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative']
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Total price cannot be negative']
    },
    currency: {
      type: String,
      default: 'GHS'
    }
  }],
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'GHS',
    enum: ['GHS', 'USD', 'EUR', 'NGN']
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'mobile_money', 'cash'],
    required: [true, 'Payment method is required']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending',
    index: true
  },
  paystackReference: {
    type: String,
    unique: true,
    sparse: true // Allow null values but ensure uniqueness when present
  },
  transactionDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  deliveryInfo: {
    address: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    deliveryDate: Date,
    deliveryStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
purchaseSchema.index({ userId: 1, transactionDate: -1 });
purchaseSchema.index({ customerId: 1, transactionDate: -1 });
purchaseSchema.index({ paymentStatus: 1, transactionDate: -1 });
purchaseSchema.index({ 'items.category': 1 });

// Virtual for order total with currency
purchaseSchema.virtual('formattedTotal').get(function() {
  return `${this.currency} ${this.totalAmount.toLocaleString()}`;
});

// Generate order number before saving
purchaseSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    this.orderNumber = `ORD-${year}${month}${day}-${random}`;
  }
  next();
});

// Static methods for analytics
purchaseSchema.statics.getTotalRevenue = function(userId) {
  return this.aggregate([
    { $match: { userId, paymentStatus: 'completed' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
};

purchaseSchema.statics.getPurchaseFrequency = function(userId) {
  return this.countDocuments({ userId, paymentStatus: 'completed' });
};

purchaseSchema.statics.getLastPurchaseDate = function(userId) {
  return this.findOne(
    { userId, paymentStatus: 'completed' },
    { transactionDate: 1 }
  ).sort({ transactionDate: -1 });
};

module.exports = mongoose.model('Purchase', purchaseSchema);