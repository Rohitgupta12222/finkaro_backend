
const express = require('express');
const router = express.Router();
require('dotenv').config();
const sendRegistrationEmail = require('../mail/registerMail'); // Adjust path to your mailer fil
const Razorpay = require('razorpay');
const Order = require('../models/order'); // Import the Order model
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_id,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});


router.post('/create-order', async (req, res) => {

  const option ={
     amount:req.body.amount,
    currency:req.body.currency,
    receipt:'Finkaro receipt',
    payment_capture:1
  }
  

  try {
    const response =await razorpay.orders.create(option)
    res.json({
      order_id:response.id,
      currency:response.currency,
      amount:response.amount
    })
  

  } catch (error) {
    console.log(error , '=========== ');
    
    res.status(500).json({ error: error.message });
  }
});
router.get('/payment/:paymentId', async (req,res)=>{
  const paymentId = req.params;

  try {
    const payment =await razorpay.payments.fetch(paymentId);
    if(!payment)return res.status(500).json('Error at Razorpay loading');
    res.json({
      status:payment.status,
      method:payment.method,
      amount:payment.amount,
      currency:payment.currency
    })

  } catch (error) {
    res.status(500).json({ error: error.message });

  }

})



module.exports = router;
