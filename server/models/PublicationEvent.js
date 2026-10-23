const mongoose = require('mongoose');

const publicationEventSchema = new mongoose.Schema({
  instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true, index: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', default: null },
  source: { type: String, enum: ['lifetime_free', 'subscription'], required: true },
  periodStartsAt: { type: Date, default: null },
  periodEndsAt: { type: Date, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('PublicationEvent', publicationEventSchema);
