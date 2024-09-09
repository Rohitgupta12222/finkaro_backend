const mongoose = require('mongoose');

const youtubeLinkSchema = new mongoose.Schema({

  title: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/.test(v);
      },
      message: props => `${props.value} is not a valid YouTube URL!`
    }
  },
  alternative: {
    type: String,
    trim: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const YouTubeLink = mongoose.model('YouTubeLink', youtubeLinkSchema);

module.exports = YouTubeLink;
