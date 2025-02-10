const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  link: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  actualPrice: {
    type: Number,
    required: true,
    min: 0
  },

  duration: {
    type: String, // e.g., "5 hours", "3 weeks"
    required: true
  },
  tags: {
    type: [String], // Define tags as an array of strings
    default: [] // Default to an empty array if no tags are provided
  },
  lessons: [
    {
      title: {
        type: String,
        required: true
      },
      content: {
        type: String,
        required: true
      },
      videoUrl: {
        type: String,
        trim: true,
      },
      duration: {
        type: String, // e.g., "10 minutes"
        required: true
      },
      status: {
        type: Boolean, // e.g., "10 minutes"
        default: false
      }
    }
  ],
  coverImage: {
    type: String,
    default: null
  },
  published: {
    type: String,
    enum: ['public', 'private'],
    default: "public",
  },
  enrolledStudents: [
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

  count: {
    type: Number,
    default: 0
  },
  mail: {
    type: Boolean,
    default: false
  }
});

// Pre-save hook to update the `updatedAt` field
courseSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
