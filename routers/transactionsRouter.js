const express = require('express');
const router = express.Router();
const Subscription = require('../models/transactions'); // Adjust the path to your model

// POST route to create a new subscription
router.post('/add', async (req, res) => {
    const { userId, productId, plan, price, razorpay_payment_id ,razorpay_order_id,razorpay_signature,status} = req.body;

    try {
        // Create a new subscription document
        const newSubscription = new Subscription({
            userId,
            productId,
            plan,
            price,
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            status
        });

        // Save the subscription to the database
        const savedSubscription = await newSubscription.save();
        res.status(201).json({
            message: 'Subscription created successfully',
            data: savedSubscription
        });
    } catch (error) {
        console.error('Error saving subscription:', error);
        res.status(500).json({
            message: 'Error saving subscription',
            error: error.message
        });
    }
});
router.get('/get', async (req, res) => {
    try {
        // Get query parameters
        const { page = 1, limit = 10, search = '' } = req.query;

        // Convert page and limit to numbers
        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);

        // Create a filter for search
        const searchFilter = search ? { $text: { $search: search } } : {};

        // Fetch paginated subscriptions
        const subscriptions = await Subscription.find(searchFilter)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .exec();

        // Count total number of documents
        const total = await Subscription.countDocuments(searchFilter);

        res.json({
            total,
            page: pageNumber,
            totalPages: Math.ceil(total / pageSize),
            subscriptions
        });
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).json({
            message: 'Error fetching subscriptions',
            error: error.message
        });
    }
});
router.get('/get/:id', async (req, res) => {
    try {
        const subscriptionId = req.params.id;

        // Find the subscription by ID
        const subscription = await Subscription.findById(subscriptionId)
            .populate('userId')       // Populate user details if needed
            .populate('productId')    // Populate product details if needed
            .exec();

        if (!subscription) {
            return res.status(404).json({
                message: 'Subscription not found'
            });
        }

        res.json({
            subscription
        });
    } catch (error) {
        console.error('Error fetching subscription:', error);
        res.status(500).json({
            message: 'Error fetching subscription',
            error: error.message
        });
    }
});
router.put('/update/:id', async (req, res) => {
    try {
        const subscriptionId = req.params.id;
        const { userId, productId, plan, price, razorpay_payment_id ,razorpay_order_id,razorpay_signature,status} = req.body;

        // Find the subscription by ID
        const subscription = await Subscription.findById(subscriptionId);

        if (!subscription) {
            return res.status(404).json({
                message: 'Subscription not found'
            });
        }

        // Update fields
        if (plan) {
            subscription.plan = plan;

            // Update endDate based on plan
            if (plan === '1-year') {
                subscription.endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
            } else if (plan === '2-year') {
                subscription.endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 2));
            } else if (plan === 'lifetime') {
                subscription.endDate = null; // Lifetime subscriptions have no end date
            }
        }

        if (status) subscription.status = status;
        if (startDate) subscription.startDate = new Date(startDate); // Ensure startDate is a Date object
        if (endDate) subscription.endDate = new Date(endDate); // Ensure endDate is a Date object

        // Save the updated subscription
        const updatedSubscription = await subscription.save();

        res.json({
            message: 'Subscription updated successfully',
            subscription: updatedSubscription
        });
    } catch (error) {
        console.error('Error updating subscription:', error);
        res.status(500).json({
            message: 'Error updating subscription',
            error: error.message
        });
    }
});
router.get('/check/valid/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const { userId } = req.query; // Assuming you pass userId as a query parameter

        if (!userId) {
            return res.status(400).json({
                message: 'User ID is required'
            });
        }

        // Find the subscription by userId and productId
        const subscription = await Subscription.findOne({
            userId,
            productId
        });

        if (!subscription) {
            return res.status(404).json({
                message: 'No subscription found for this product'
            });
        }

        // Check if the subscription is valid
        const currentDate = new Date();
        const isValid = subscription.status === 'active' &&
            (subscription.plan === 'lifetime' ||
                (subscription.endDate && subscription.endDate > currentDate));

        res.json({
            isValid
        });
    } catch (error) {
        console.error('Error checking subscription validity:', error);
        res.status(500).json({
            message: 'Error checking subscription validity',
            error: error.message
        });
    }
});

router.get('/check/purchased', async (req, res) => {
    try {
        const { userId, productId } = req.query;

        if (!userId || !productId) {
            return res.status(400).json({
                message: 'User ID and Product ID are required'
            });
        }

        // Find a subscription by userId and productId
        const subscription = await Subscription.findOne({
            userId,
            productId
        });

        if (!subscription) {
            return res.status(404).json({
                message: 'No subscription found for this product'
            });
        }

        // Check if the subscription is valid
        const currentDate = new Date();
        const isValid = subscription.status === 'active' &&
            (subscription.plan === 'lifetime' || (subscription.endDate && subscription.endDate > currentDate));

        res.json({
            hasPurchased: isValid
        });
    } catch (error) {
        console.error('Error checking purchase status:', error);
        res.status(500).json({
            message: 'Error checking purchase status',
            error: error.message
        });
    }
});




module.exports = router;
