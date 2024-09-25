const mongoose = require('mongoose');

const DashboardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverImage: [
    {
      type: String,  // Stores the file paths of multiple cover images
      required: true
    }
  ],
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
  purchaseDashboard: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'  // Reference to the User model for students
    }
  ],
  links: {
    type: String,
    default: ''
  },
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
    default: true
  },
  zipfileLink: {
    type: String,
    default: ''
  },
   excelFileLink: {
    type: String,
    default: ''
  },
  actualPrice: {
    type: String,
    default: ''
  },
  offerPrice:{
      type: String,
    default: ''
  },
  shortDescription:{
     type: String,
    default: ''
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
DashboardSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Optional: Create a model from the schema
const Dashboard = mongoose.model('Dashboard', DashboardSchema);

module.exports = Dashboard;
