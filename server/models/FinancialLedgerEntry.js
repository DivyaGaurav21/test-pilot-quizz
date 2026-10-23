const mongoose = require('mongoose');

const financialLedgerEntrySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['purchase', 'refund', 'chargeback', 'gateway_fee', 'tax', 'platform_commission', 'institute_share', 'payout', 'payout_reversal', 'subscription_payment'],
    required: true,
  },
  instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', default: null, index: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', default: null },
  purchaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamPurchase', default: null },
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', default: null },
  payoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payout', default: null },
  amountPaise: { type: Number, required: true },
  currency: { type: String, required: true, uppercase: true },
  commissionableAmountPaise: { type: Number, default: 0 },
  notes: { type: String, trim: true, default: '' },
  reference: { type: String, trim: true, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: { createdAt: true, updatedAt: false } });

financialLedgerEntrySchema.pre('save', function preventLedgerMutation(next) {
  if (!this.isNew) {
    return next(new Error('Financial ledger entries are immutable'));
  }
  return next();
});

for (const operation of ['updateOne', 'updateMany', 'findOneAndUpdate', 'replaceOne', 'deleteOne', 'deleteMany', 'findOneAndDelete']) {
  financialLedgerEntrySchema.pre(operation, function preventLedgerMutation() {
    throw new Error('Financial ledger entries are immutable');
  });
}

financialLedgerEntrySchema.index({ type: 1, purchaseId: 1 });
financialLedgerEntrySchema.index({ type: 1, payoutId: 1 });

module.exports = mongoose.model('FinancialLedgerEntry', financialLedgerEntrySchema);
