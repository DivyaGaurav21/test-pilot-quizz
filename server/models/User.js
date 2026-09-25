const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: function () {
      return this.authProvider === 'local';
    },
    select: false,
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    required: true,
    default: 'local',
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

module.exports = mongoose.model('User', userSchema);