const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      comment: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  purchaseBook: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'  // Reference to the User model for students
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  },

   pdfFile: {
    type: String,
    default: 'assets/product/Finkaro-Book-Romance-with-Equity.pdf'
  },
  actualEbookPrice: {
    type: Number,
    default: 0
  },
  offerEbookPrice:{
      type: Number,
    default: 0
  },
  actualHardPrice: {
    type: Number,
    default: 0
  },
  offerHardPrice:{
      type: Number,
    default: 0
  },


  enrolled: [
    {
      users:
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },

    }
  ],
  count:{
    type:Number,
    default:0
  }
});

// Pre-save hook to update the `updatedAt` field
BookSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Optional: Create a model from the schema
const Book = mongoose.model('Book', BookSchema);

module.exports = Book;
