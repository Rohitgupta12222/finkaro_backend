const express = require('express');
const router = express.Router();
const Subscription = require('../models/transactions'); // Adjust the path to your model
const User = require('../models/users')
const Dashboard = require('../models/dashboard')
const Course = require('../models/course')
const Book = require('../models/book')
const Services = require('../models/servicesModel')
const sendRegistrationEmail = require('../mail/registerMail'); // Adjust path to your mailer file
const axios = require('axios');
const { dashboardBuy, courseBuy, serviceBuy, hardCopyBuy,softCopyBuy } = require('../mail/templateMail');
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
            { email: prefilldata?.email },
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

            dashboard.count++; // Increment the count
         await dashboard.save(); // Save the updated dashboard
         dashboardBuy(Subscriptiondata?.email,dashboard?.title,"https://www.finkaro.com/dashboard/"+productId);

        } else if (savedSubscription?.productsType == 'course') {

            const course = await Course.findById(productId);

            course.count++;
            await course.save();
            console.log(course , "course");
            
            courseBuy(Subscriptiondata?.email,users?.name,course,Subscriptiondata.plan,"https://www.finkaro.com/course/"+productId);
            console.log( "course send");

        } else if (savedSubscription?.productsType == 'softcopyBook') {
 
            const book = await Book.findById(productId);
            book.count++;
            await book.save();
            const attachmentPath = `${process.env.FRONTEND_LINK}/assets/product/FinkaroEbook.pdf`;
            softCopyBuy(Subscriptiondata?.email,attachmentPath);
        }
        else if (savedSubscription?.productsType === 'Hardcopybook') {
            try {
                const book = await Book.findById(productId);
                if (!book) {
                    throw new Error('Book not found');
                }

                book.count++;
                await book.save();
        
                // Login to Shiprocket 
                const loginResponse = await axios.post(
                    'https://apiv2.shiprocket.in/v1/external/auth/login',
                    {
                        email: "anilmg8898@gmail.com", // Shiprocket email
                        password: "Finkaro@2025", // Shiprocket password
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );
                console.log(loginResponse , '=========== loginResponse');
                
        
                const { token } = loginResponse.data;
                const shipRocketToken = `Bearer ${token}`;
                console.log(shipRocketToken , '========= shipRocketToken');
                
        
                // Generate current date and time
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
                const day = String(now.getDate()).padStart(2, '0');
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const order_date = `${year}-${month}-${day} ${hours}:${minutes}`;
        
                // Prepare order data
                const orderData = {
                    order_id: generateUniqueId(),
                    order_date: order_date,
                    pickup_location: "warehouse",
                    billing_customer_name: users?.name || "N/A",
                    billing_address: users?.address || "N/A",
                    billing_city: "", // Needs to be populated
                    billing_last_name: "",
                    billing_pincode: extractDataAfterPincode(users?.address) || "000000",
                    billing_state: "Maharashtra",
                    billing_country: "India",
                    billing_email: users?.email || "N/A",
                    billing_phone: users?.phoneNumber || "0000000000",
                    shipping_is_billing: true,
                    order_items: [
                        {
                            name: "Finkaro-Book-Romance-with-Equity",
                            sku: "SKU1234",
                            units: 1,
                            selling_price: Number(savedSubscription?.price) || 0,
                        },
                    ],
                    payment_method: "Prepaid",
                    shipping_charges: 0,
                    giftwrap_charges: 0,
                    transaction_charges: 0,
                    total_discount: 0,
                    sub_total: Number(savedSubscription?.price) || 0, // Fixed typo `prices` to `price`
                    length: 24,
                    breadth: 18,
                    height: 2,
                    weight: 0.5,

                };
        
                // Create order in Shiprocket
                const apiUrl = 'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc';
                const response = await axios.post(apiUrl, orderData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': shipRocketToken,
                    },
                });
        
        
                
            } catch (error) {
                if (error.response?.data) {
                    console.error('API Error:', error.response.data);
                } else {
                    console.error('Error:', error.message);
                }
            }
        
            // Send email notification
            try {
                hardCopyBuy(Subscriptiondata?.email);
            } catch (emailError) {
                console.error('Error sending email:', emailError.message);
            }
        }
        
        else if (savedSubscription?.productsType == 'services') {
            const services = await Services.findById(productId);
                  services.count++;
            await services.save();
            serviceBuy(Subscriptiondata?.email,users?.name,services,savedSubscription?.startDate,"https://www.finkaro.com/services/"+productId);
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
        const { page, limit, search, productsType } = req.query;

        // Convert page and limit to numbers
        const pageNumber = parseInt(page, 10) || 1; // Default to page 1
        const pageSize = parseInt(limit, 10) || 10; // Default to 10 items per page

        // Create a filter object
        let filter = {};

        // Apply search filter if provided
        if (search) {
            filter.$text = { $search: search };
        }

        // Apply productsType filter if provided and not empty
        if (productsType && productsType !== '') {
            filter.productsType = productsType;
        }

        // Fetch paginated subscriptions in descending order
        const subscriptions = await Subscription.find(filter)
            .sort({ _id: -1 }) // Sort by `_id` in descending order
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .exec();

        // Count total number of documents
        const count = await Subscription.countDocuments(filter);

        res.json({
            count,
            subscriptions,
        });
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).json({
            message: 'Error fetching subscriptions',
            error: error.message,
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
function extractDataAfterPincode(input) {
    const pincodeIndex = input.indexOf('pincode -');
    if (pincodeIndex !== -1) {
      return input.substring(pincodeIndex + 10).trim();
    }
    return '';
  }
  function generateUniqueId() {
    const timestamp = Date.now(); // Get the current timestamp in milliseconds
    const randomNum = Math.floor(Math.random() * 1000); // Generate a random number between 0 and 999
    return `${timestamp}${randomNum}`.slice(-7); // Concatenate and take the last 7 digits
}

module.exports = router;
