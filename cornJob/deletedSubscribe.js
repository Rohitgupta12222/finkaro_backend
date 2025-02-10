const cron = require('node-cron');
const mongoose = require('mongoose');
const User = require('../models/users'); // Adjust the path as needed

cron.schedule('* * * * *', async () => {
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
        console.log(`[${new Date().toISOString()}] Deleted ${result?.modifiedCount} or ${result?.name} expired subscriptions.`);
    } catch (error) {
        console.error('Error deleting expired subscriptions:', error);
    }
});
