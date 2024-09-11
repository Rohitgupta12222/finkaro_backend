const mongoose = require('mongoose');

const youtubeLinkSchema = new mongoose.Schema({

  title: {
    type: String,
    trim: true
  },
  video: {
    type: String,
    required: true,
    trim: true,
  },
  alt: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['public', 'private'],
    default: "public"
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

const YouTubeLink = mongoose.model('YouTubeLink', youtubeLinkSchema);

module.exports = YouTubeLink;
