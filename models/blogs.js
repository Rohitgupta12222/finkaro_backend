const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shortDescription: {
    type: String,
    default: '',

  },
  coverImage: {
    type: String,
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: [
    {
      name: {
        type: String,
              required: true
      },
   
      comment: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: Boolean,
       default:false
      },
    }
  ],
  links:
  {
    type: String,
    default: ''
  }
  ,
  status: {
    type: String,
    enum: ['public', 'private'],
    default: "public"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  },
  mail: {
    type: Boolean,
    default: false
  }
  
});

// Pre-save hook to update the `updatedAt` field
blogSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Optional: Create a model from the schema
const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
