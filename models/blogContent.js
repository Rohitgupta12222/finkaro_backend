const mongoose = require('mongoose');


const blogContentSchema = new mongoose.Schema({
  blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const BlogContents = mongoose.model('BlogContents', blogContentSchema);

module.exports = BlogContents;
