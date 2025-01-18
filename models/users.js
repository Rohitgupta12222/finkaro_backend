const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const userSchema = new mongoose.Schema({
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
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  photoURL: {
    type: String,
    default: null
  },
  phoneNumber: {
    type: String,
    default: null
  },
  pincode: {
    type: String,
    default: null
  },
  address: {
    type: String,

  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  enrolled: [
    {
      SubscriptionId:
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
        required: true
      },
      productId: {
        type: String,
        required: true
      },
      status: {
        type: String,
        enum: ['active', 'expired', 'cancelled', 'refund'],
        required: true
      },
      plan: {
        type: String,
        enum: ['1-year', '2-year', 'lifetime'],
        required: true
      },
      startDate: {
        type: Date,
        required: true
      },
      endDate: {
        type: Date,
        default: ''
      },
      order_id: {
        type: String,
        required: true

      }
    }
  ],
  loginType: {
    type: String,
    default: "formLogin"
  }

});


userSchema.pre('save', async function (next) {
  const user = this
  if (!user.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(user.password, salt)
    user.password = hashPassword
    next()
  } catch (error) {
    return next(error)
  }


})
userSchema.methods.comparePassword = function (candidatePassword) {
  try {
    return bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw error
  }
}
const User = mongoose.model('User', userSchema);

module.exports = User;
