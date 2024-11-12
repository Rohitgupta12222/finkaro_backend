const express = require('express');
const router = express.Router();
const Subscription = require('../models/transactions'); // Adjust the path to your model
const User = require('../models/users')
const Dashboard = require('../models/dashboard')
const Course = require('../models/course')
const Book = require('../models/book')
const Services = require('../models/servicesModel')
const sendRegistrationEmail = require('../mail/registerMail'); // Adjust path to your mailer file
require('dotenv').config();
// POST route to create a new subscription
router.post('/add', async (req, res) => {
    const {
        productId,
        plan,
        price,
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        status,
        productsType,
        transactionId,
        prefilldata
    } = req.body;

    try {

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }
        if (!plan) {
            return res.status(400).json({ message: 'Plan is required' });
        }
        if (!price) {
            return res.status(400).json({ message: 'Price is required' });
        }
        if (!razorpay_payment_id) {
            return res.status(400).json({ message: 'Razorpay Payment ID is required' });
        }
        if (!razorpay_order_id) {
            return res.status(400).json({ message: 'Razorpay Order ID is required' });
        }
        if (!razorpay_signature) {
            return res.status(400).json({ message: 'Razorpay Signature is required' });
        }

        // Check for existing subscription with the same razorpay_payment_id, razorpay_order_id, or razorpay_signature
        const existingSubscription = await Subscription.findOne({
            $or: [
                { razorpay_payment_id },
                { razorpay_order_id },
                { razorpay_signature }
            ]
        });

        if (existingSubscription) {
            return res.status(409).json({
                message: 'Subscription with the same payment ID, order ID, or signature already exists'
            });
        }



        const user = await User.findOne({ email: prefilldata?.email });
        const updatedUser = await User.findOneAndUpdate(
            { email: prefilldata?.email }, // Find the user by email
            {
                phoneNumber: prefilldata?.contact,
                address: prefilldata?.address
            }, // Fields to update
            { new: true, runValidators: true } // Options: return the updated document and run validators
        );

        const userId = updatedUser?._id

        const newSubscription = await new Subscription({
            userId,
            email: prefilldata?.email,
            phone: prefilldata?.contact,
            productId,
            plan,
            price,
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            status,
            productsType,
            transactionId
        });


        const savedSubscription = await newSubscription.save();
        console.log(savedSubscription?.productsType, '=================== savedSubscription =========');




        const users = await User.findById(userId);

        let Subscriptiondata = {
            SubscriptionId: savedSubscription?._id,
            productId: savedSubscription?.productId,
            status: savedSubscription?.status,
            plan: savedSubscription?.plan,
            startDate: savedSubscription?.startDate,
            phoneNumber: prefilldata?.contact,
            email: prefilldata?.email,
            endDate: savedSubscription?.endDate,
            order_id: savedSubscription?.razorpay_order_id
        };
        users.enrolled.push(Subscriptiondata);
        let updateUserData = await users.save();    
        if (savedSubscription?.productsType == 'dashboard') {
            const dashboard = await Dashboard.findById(productId);
       
            dashboard.enrolled.push(userId); // Directly push userId (string) into the array
            dashboard.count++; // Increment the count
            const updatedDashboard = await dashboard.save(); // Save the updated dashboard
            
        } else if (savedSubscription?.productsType == 'course') {
      
            const course = await Course.findById(productId);
    
            course.enrolled.push( userId );
            course.count++;
            await course.save();

        } else if (savedSubscription?.productsType == 'softcopyBook') {
            
            const book = await Book.findById(productId);
            book.enrolled.push( userId );
            book.count++;
            await book.save();
            const attachmentPath = `${process.env.FRONTEND_LINK}/assets/product/Finkaro-Book-Romance-with-Equity.pdf`;
            sendRegistrationEmail(savedSubscription?.email, ' Softcopy Received  from Finkaro', 'Please  Find the Attchement And stay connected with Finkaro', attachmentPath);


        }
          else if (savedSubscription?.productsType == 'Hardcopybook') {
            
            const book = await Book.findById(productId);
            book.enrolled.push( userId );
            book.count++;
            await book.save();
            const attachmentPath = `${process.env.FRONTEND_LINK}/assets/product/Finkaro-Book-Romance-with-Equity.pdf`;
            sendRegistrationEmail(savedSubscription?.email, ' test Hard copy Received  from Finkaro', 'Please  Find the Attchement And stay connected with Finkaro', attachmentPath);


        }
        
        
        
        else if (savedSubscription?.productsType == 'services') {
            const services = await Services.findById(productId);
            console.log(services);
            
            services.enrolled.push( userId );
            services.count++;
            await services.save();
        }


        res.status(201).json({
            message: 'Subscription created successfully',
            data: savedSubscription,
            userData: updateUserData
        });

    } catch (error) {
        // Log error details
        console.error('Error saving subscription:', error);

        // Check if the error is related to duplicate keys
        if (error.code === 11000) {
            return res.status(400).json({
                message: 'Duplicate key error',
                error: error.message
            });
        }

        // Handle other errors
        res.status(500).json({
            message: 'Error saving subscription',
            error: error.message
        });
    }
});


router.get('/get', async (req, res) => {
    try {
        // Get query parameters
        const { page, limit, search } = req.query;

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
        const { userId, productId, plan, price, razorpay_payment_id, razorpay_order_id, razorpay_signature, status, productsType } = req.body;

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
