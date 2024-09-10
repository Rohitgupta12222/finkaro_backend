// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  razorpayOrderId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  receipt: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
