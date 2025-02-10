const cron = require('node-cron');
const mongoose = require('mongoose');
const User = require('../models/users'); // Adjust the path as needed

cron.schedule('0 1 * * *', async () => {
    console.log('Running subscription cleanup job...');

    try {
        const now = new Date();

        const result = await User.updateMany(
            {}, 
            { 
                $pull: { 
                    enrolled: { 
                        endDate: { $lt: now } 
                    } 
                } 
            }
        );
    } catch (error) {
        console.error('Error deleting expired subscriptions:', error);
    }
});
