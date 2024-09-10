
const express = require('express');
const router = express.Router();
const sendRegistrationEmail = require('../mail/registerMail'); // Adjust path to your mailer fil
const Razorpay = require('razorpay');
const Order = require('../models/order'); // Import the Order model
 const BASE_URL = process.env.BASE_URL; // Change this to your actual base URL
 const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY,
    key_secret: process.env.JWT_SECRET,
  });


    router.post('/create-order', async (req, res) => {
        console.log('calling data razorpay');
         
  try {
    const options = {
      amount: 50000, // Amount in paise (100 paise = 1 INR)
      currency: 'INR',
      receipt: 'receipt#1'
    };

    // Create an order with Razorpay
    const order = await razorpay.orders.create(options);
    
    // Save order details to MongoDB
    const newOrder = new Order({
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    });
    
    await newOrder.save();

    // Respond with the order details
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
    });
    
  

module.exports = router;
