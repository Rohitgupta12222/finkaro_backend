const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const subscribeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    default:"subscribe"
  }

});



const Subscribe = mongoose.model('Subscribe', subscribeSchema);

module.exports = Subscribe;
