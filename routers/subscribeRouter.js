
const express = require('express');
const Subscribe = require('../models/subscribeList.js');
const router = express.Router();
const sendsubscribemail = require('../mail/subscribeMail.js'); // Adjust path to your mailer file


router.post('/mail', async (req, res) => {
  const { email, name ,subject ,contact} = req.body;
  try {

    const existingUser = await Subscribe.findOne({ email });
    if (existingUser) {
      console.log('exiestion user',existingUser);
      await sendsubscribemail(email, name,subject,contact);
      res.status(201).json({message:"Subscribe mail sended successfully"})
      console.log("Subscribe mail sended successfully")

    }else{
   data = req.body
   data.phoneNumber = contact
   console.log(data , 'request body ');

      const userData = new Subscribe(req.body)
     const response = await userData.save()
   
     await sendsubscribemail(email, name,subject,contact);
     res.status(201).json({message:"Subscribe mail sended successfully"})

      console.log("Subscribe mail sended successfully")

    }

  } catch (message) {

    console.log('message ', message);
    res.status(500).json({
      message: "internal Server message",
      message: message
    })
  }
}
)
router.post('/add', async (req, res) => {
  try {
    const { name, email, contact } = req.body;

    // Validate input
    if (!email || !contact) {
      return res.status(400).json({ message: 'Email and contact are required' });
    }

    // Check if the email is already subscribed
    const existingSubscription = await Subscribe.findOne({ email });
    if (existingSubscription) {
      return res.status(409).json({ message: 'This user is already subscribed' }); // 409 Conflict
    }

    // Create a new subscription
    const newSubscription = new Subscribe({
      name,
      email,
      contact,
    });

    await newSubscription.save();
    this.sendSubscribeMail(email, name);
    res.status(201).json({ message: 'Subscription added successfully', data: newSubscription });
    rh

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});


router.get('/list', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Default page = 1, limit = 10

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Retrieve subscriptions with pagination
    const subscriptions = await Subscribe.find()
      .skip(skip)
      .limit(Number(limit));

    // Get the total count of documents
    const totalCount = await Subscribe.countDocuments();

    res.status(200).json({
      message: 'Subscriptions retrieved successfully',
      data: subscriptions,
      count: totalCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});



module.exports = router;
