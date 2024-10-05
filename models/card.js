
const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    percentage: { type: Number, required: true },
    companyName: { type: String, required: true },
    duration: { type: String, required: true },
    logo: { type: String, required: true }, // URL or path to logo image
});

module.exports = mongoose.model('Card', cardSchema);
