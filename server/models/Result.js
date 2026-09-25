// import mongoose from 'mongoose';

// const resultSchema = new mongoose.Schema(
//   {
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
//     answers: { type: Map, of: Number, default: {} },
//     score: { type: Number, default: 0 },
//     correctAnswers: { type: Number, default: 0 },
//     totalQuestions: { type: Number, default: 0 },
//   },
//   { timestamps: true }
// );

// export default mongoose.model('Result', resultSchema);

const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  totalMarks: {
    type: Number,
    required: true,
  },
  correctAnswers: {
    type: Number,
    required: true,
  },
  wrongAnswers: {
    type: Number,
    required: true,
  },
  unanswered: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  timeTaken: {
    type: Number,
    required: true,
  },
}, {
  timestamps: { createdAt: 'submittedAt', updatedAt: false },
});

module.exports = mongoose.model('Result', resultSchema);
