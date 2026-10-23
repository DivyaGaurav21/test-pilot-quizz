const mongoose = require('mongoose');

const GRACE_SECONDS = 60;

const attemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['in_progress', 'submitted', 'expired'],
      default: 'in_progress',
      index: true,
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    submittedAt: {
      type: Date,
    },
    answers: {
      type: Map,
      of: String,
      default: {},
    },
    resultId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Result',
    },
    claimedTimeTaken: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

attemptSchema.index({ userId: 1, examId: 1, status: 1 });

attemptSchema.methods.isWithinSubmitWindow = function isWithinSubmitWindow(now = new Date()) {
  return now.getTime() <= this.expiresAt.getTime() + GRACE_SECONDS * 1000;
};

attemptSchema.statics.GRACE_SECONDS = GRACE_SECONDS;

module.exports = mongoose.model('Attempt', attemptSchema);
