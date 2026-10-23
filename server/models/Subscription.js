const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  instituteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institute',
    required: true,
    index: true,
  },
  pendingKey: { type: String, unique: true, sparse: true },
  plan: { type: String, enum: ['monthly', 'yearly'], required: true },
  status: {
    type: String,
    enum: ['pending', 'active', 'past_due', 'expired'],
    default: 'pending',
    required: true,
  },
  pricePaise: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, uppercase: true },
  publicationLimit: { type: Number, required: true, min: 1 },
  durationMonths: { type: Number, required: true, min: 1 },
  publicationsUsed: { type: Number, default: 0, min: 0 },
  refundedPaise: { type: Number, default: 0, min: 0 },
  startsAt: Date,
  endsAt: Date,
  paymentVerifiedAt: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

subscriptionSchema.index({ instituteId: 1, status: 1, endsAt: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
