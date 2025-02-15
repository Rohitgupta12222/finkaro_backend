require('dotenv').config()
const mongoose = require('mongoose')
const mongoDbURL = process.env.DB_URL;
mongoose.connect(`${mongoDbURL}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
})
const db = mongoose.connection;
db.on('connected', () => console.log('mongo database connected'));
db.on('error', async (err) => {
    console.log('mongo database error ', err);
    await mongoose.connection.close();
    console.log('Connection closed due to error.');
    process.exit(1); // Exit with failure
});
db.on('disconnected', () => console.log('mongo database disconnected'))
module.exports = db