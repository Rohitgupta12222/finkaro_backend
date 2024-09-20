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
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: String, // e.g., "5 hours", "3 weeks"
    required: true
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
        validate: {
          validator: function(v) {
            return /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/.test(v);
          },
          message: props => `${props.value} is not a valid YouTube URL!`
        }
      },
      duration: {
        type: String, // e.g., "10 minutes"
        required: true
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
    default: "private",
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
courseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
