const mongoose = require('mongoose');
const { USER_ROLE_ENUM, ROLES } = require('../constants/roles');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 120,
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
    enum: USER_ROLE_ENUM,
    default: ROLES.LEGACY_USER,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

module.exports = mongoose.model('User', userSchema);