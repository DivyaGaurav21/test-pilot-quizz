const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
  },
  topic: {
    type: String,
    trim: true,
  },
  difficulty: {
    type: String,
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be a positive number'],
  },
  totalQuestions: {
    type: Number,
    required: true,
    default: 0,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  instituteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institute',
    default: null,
  },
  pricePaise: {
    type: Number,
    default: 0,
    min: 0,
  },
  archivedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

module.exports = mongoose.model('Exam', examSchema);
