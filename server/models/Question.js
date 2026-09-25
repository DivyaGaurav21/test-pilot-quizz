// import mongoose from 'mongoose';

// const questionSchema = new mongoose.Schema(
//   {
//     exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
//     externalId: Number,
//     question: { type: String, required: true },
//     options: [{ type: String, required: true }],
//     correctAnswer: { type: Number, required: true },
//     explanation: String,
//   },
//   { timestamps: true }
// );

// export default mongoose.model('Question', questionSchema);
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function (options) {
        return options.length === 4;
      },
      message: 'A question must have exactly 4 options',
    },
  },
  correctAnswer: {
    type: String,
    required: [true, 'Correct answer is required'],
  },
  explanation: {
    type: String,
    trim: true,
  },
  marks: {
    type: Number,
    default: 1,
  },
});

module.exports = mongoose.model('Question', questionSchema);
