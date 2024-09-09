require('dotenv').config()
const mongoose = require('mongoose')
// const mongoDbURL = process.env.DB_URL_LOCAL;
 const mongoDbURL = process.env.DB_URL;
mongoose.connect(`${mongoDbURL}`,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
const db = mongoose.connection;
db.on('connected',()=> console.log('mongo database connected'));
db.on('error',(err)=> console.log('mongo database error ',err));
db.on('disconnected',()=> console.log('mongo database disconnected'))
module.exports = db