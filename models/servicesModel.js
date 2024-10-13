const mongoose = require('mongoose');
const { Schema } = mongoose;

const servicesSchema = new Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  imgSrc: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    required: true
  },
  description: [{
    list: {
      type: String,
      required: true
    }
  }],
  plan: [{
    name: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    amount: {
      type: String,
      required: true
    }
  }],
    enrolled:  {
      type:[String],
      default:[]

    },

    count:{
      type:Number,
      default:0
    }
});

module.exports = mongoose.model('Services', servicesSchema);
