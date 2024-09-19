const mongoose = require('mongoose');
const { Schema } = mongoose;

// Helper function to calculate endDate based on the plan
const calculateEndDate = (plan) => {
  const now = new Date();
  if (plan === '1-year') {
    return new Date(now.setFullYear(now.getFullYear() + 1));
  } else if (plan === '2-year') {
    return new Date(now.setFullYear(now.getFullYear() + 2));
  } else {
    return new Date(now.setFullYear(now.getFullYear() + 34));
  }
};

const subscriptionSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  plan: {
    type: String,
    enum: ['1-year', '2-year', 'lifetime'],
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: function () {
      return calculateEndDate(this.plan);
    }
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'refund'],
    default: 'active'
  },
  razorpay_payment_id: {
    type: String,
    required: true,
    unique: true
  },
  razorpay_order_id: {
    type: String,
    required: true,
    unique: true
  },
  productsType: {
    type: String,
    enum: ['course', 'dashboard', 'book', 'services'],
    default: 'services'
  },
  razorpay_signature: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to update the updatedAt field
subscriptionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes
subscriptionSchema.index({ razorpay_payment_id: 1 }, { unique: true });
subscriptionSchema.index({ razorpay_order_id: 1 }, { unique: true });
subscriptionSchema.index({ razorpay_signature: 1 }, { unique: true });

// Export the model
module.exports = mongoose.model('Subscription', subscriptionSchema);
