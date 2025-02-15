const express = require('express');
const Subscribe = require('../models/subscribeList.js');
const router = express.Router();
const { sendsubscribemail } = require('../mail/subscribeMail.js'); // Adjust path to your mailer file


router.post('/add', async (req, res) => {
    try {
        const { name, email, contact } = req.body;
        console.log('Request body:', req.body);

        if (!email || !contact) {
            return res.status(400).json({ message: 'Email and contact are required' });
        }

        const existingSubscription = await Subscribe.findOne({ email });
        if (existingSubscription) {
            return res.status(409).json({ message: 'This user is already subscribed' });
        }

        const newSubscription = new Subscribe({ name, email, contact });
        await newSubscription.save();
         sendsubscribemail(email, name);

        res.status(201).json({ message: 'Subscription added successfully', data: newSubscription });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

router.get('/list', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const subscriptions = await Subscribe.find().skip(skip).limit(limit);
        const totalCount = await Subscribe.countDocuments();

        res.status(200).json({
            message: 'Subscriptions retrieved successfully',
            data: subscriptions,
            count: totalCount,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

module.exports = router;
