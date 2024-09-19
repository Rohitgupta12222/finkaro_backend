const mongoose = require('mongoose');
const { Schema } = mongoose;

const subscriptionSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // This should reference your Product model
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
      if (this.planType === '1-year') {
        return new Date(new Date().setFullYear(new Date().getFullYear() + 1));
      } else if (this.planType === '2-year') {
        return new Date(new Date().setFullYear(new Date().getFullYear() + 2));
      } else {
        return null; // Lifetime has no end date
      }
    }
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled','refund'],
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

module.exports = mongoose.model('Subscription', subscriptionSchema);
