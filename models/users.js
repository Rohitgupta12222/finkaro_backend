const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
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
  phoneNumber:{
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
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
userSchema.methods.comparePassword =  function(candidatePassword){
  try {
      return  bcrypt.compare(candidatePassword,this.password)
  } catch (error) {
     throw error
  }
}
const User = mongoose.model('User', userSchema);

module.exports = User;
