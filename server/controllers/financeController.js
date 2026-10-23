const mongoose = require('mongoose');
const Institute = require('../models/Institute');
const Exam = require('../models/Exam');
const ExamPurchase = require('../models/ExamPurchase');
const Subscription = require('../models/Subscription');
const Payout = require('../models/Payout');
const FinancialLedgerEntry = require('../models/FinancialLedgerEntry');
const MonetizationSettings = require('../models/MonetizationSettings');
const PublicationEvent = require('../models/PublicationEvent');
const { getSettings } = require('../services/monetizationService');
const { addCalendarMonths } = require('../utils/datePeriods');
const {
  verifyExamPurchase,
  addPurchaseAdjustment,
  addSubscriptionAdjustment,
  requestPayout,
  reviewPayout,
  getAvailableBalance,
} = require('../services/financialService');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const getMySubscription = async (req, res) => {
  try {
    await Subscription.updateMany(
      { instituteId: req.institute._id, status: 'active', endsAt: { $lte: new Date() } },
      { $set: { status: 'expired' } },
    );
    const [subscription, settings, institute] = await Promise.all([
      Subscription.findOne({ instituteId: req.institute._id }).sort({ createdAt: -1 }),
      getSettings(),
      Institute.findById(req.institute._id).select('freePublicationsUsed'),
    ]);
    return res.status(200).json({
      subscription,
      freePublicationsUsed: institute.freePublicationsUsed,
      freePublicationLimit: settings.freePublicationLimit,
      plans: { monthly: settings.monthlyPlan, yearly: settings.yearlyPlan },
      currency: settings.currency,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch subscription', error: error.message });
  }
};

const adjustSubscription = async (req, res) => {
  const { id } = req.params;
  const { type, amountPaise, notes, reference } = req.body || {};
  if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid subscription id' });
  if (!['refund', 'chargeback', 'gateway_fee', 'tax'].includes(type)) {
    return res.status(400).json({ message: 'type must be refund, chargeback, gateway_fee, or tax' });
  }
  if (typeof notes !== 'string' || !notes.trim()) {
    return res.status(400).json({ message: 'notes are required for an auditable financial adjustment' });
  }
  try {
    return res.status(200).json(await addSubscriptionAdjustment({
      subscriptionId: id,
      type,
      amountPaise,
      notes: notes.trim(),
      reference: typeof reference === 'string' ? reference.trim() : '',
      userId: req.user._id,
    }));
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to adjust subscription payment' });
  }
};

const requestSubscription = async (req, res) => {
  try {
    const { plan } = req.body || {};
    if (!['monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({ message: 'plan must be monthly or yearly' });
    }

    const active = await Subscription.findOne({
      instituteId: req.institute._id,
      status: 'active',
      endsAt: { $gt: new Date() },
    });
    if (active) {
      return res.status(409).json({ message: 'An active subscription already exists' });
    }

    const pending = await Subscription.findOne({
      instituteId: req.institute._id,
      status: 'pending',
    });
    if (pending) {
      return res.status(409).json({ message: 'A subscription payment is already awaiting verification' });
    }

    const settings = await getSettings();
    const selectedPlan = settings[`${plan}Plan`];
    const subscription = await Subscription.create({
      instituteId: req.institute._id,
      pendingKey: req.institute._id.toString(),
      plan,
      status: 'pending',
      pricePaise: selectedPlan.pricePaise,
      currency: settings.currency,
      publicationLimit: selectedPlan.publicationLimit,
      durationMonths: selectedPlan.durationMonths,
    });
    return res.status(201).json({
      subscription,
      message: 'Subscription request recorded. Access starts only after SUPER_ADMIN verifies payment.',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A subscription request is already pending' });
    }
    return res.status(500).json({ message: 'Failed to request subscription', error: error.message });
  }
};

const createExamPurchase = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid exam id' });
    const exam = await Exam.findOne({ _id: id, isPublished: true });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    if (exam.pricePaise <= 0) return res.status(400).json({ message: 'This exam is free and does not require a purchase' });

    const prior = await ExamPurchase.findOne({
      examId: exam._id,
      buyerId: req.user._id,
      status: { $in: ['pending', 'verified'] },
    });
    if (prior) return res.status(prior.status === 'verified' ? 200 : 202).json(prior);

    const settings = await getSettings();
    const purchase = await ExamPurchase.create({
      examId: exam._id,
      instituteId: exam.instituteId || null,
      buyerId: req.user._id,
      amountPaise: exam.pricePaise,
      commissionBasisPoints: settings.commissionBasisPoints,
      currency: settings.currency,
      activeKey: `${exam._id}:${req.user._id}`,
    });
    return res.status(201).json({
      purchase,
      message: 'Purchase request recorded. SUPER_ADMIN must verify payment before exam access is granted.',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A purchase request already exists for this exam' });
    }
    return res.status(500).json({ message: 'Failed to create exam purchase', error: error.message });
  }
};

const requestInstitutePayout = async (req, res) => {
  try {
    const payout = await requestPayout({
      instituteId: req.institute._id,
      userId: req.user._id,
      amountPaise: req.body?.amountPaise,
    });
    return res.status(201).json(payout);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to request payout' });
  }
};

const getInstituteFinance = async (req, res) => {
  try {
    const [entries, payouts, availableBalancePaise, settings] = await Promise.all([
      FinancialLedgerEntry.find({ instituteId: req.institute._id }).sort({ createdAt: -1 }).limit(100),
      Payout.find({ instituteId: req.institute._id }).sort({ createdAt: -1 }),
      getAvailableBalance(req.institute._id),
      getSettings(),
    ]);
    return res.status(200).json({
      entries,
      payouts,
      availableBalancePaise,
      minimumPayoutPaise: settings.minimumPayoutPaise,
      currency: settings.currency,
      payoutSchedule: settings.payoutSchedule,
      payoutMode: settings.payoutMode,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch institute financial records', error: error.message });
  }
};

const getSettingsForAdmin = async (req, res) => {
  try {
    return res.status(200).json(await getSettings());
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch monetization settings', error: error.message });
  }
};

const getPublicPlans = async (req, res) => {
  try {
    const settings = await getSettings();
    return res.status(200).json({
      currency: settings.currency,
      freePublicationLimit: settings.freePublicationLimit,
      monthlyPlan: settings.monthlyPlan,
      yearlyPlan: settings.yearlyPlan,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch plans', error: error.message });
  }
};

const updateSettings = async (req, res) => {
  const body = req.body || {};
  const {
    monthlyPlan,
    yearlyPlan,
    currency,
    freePublicationLimit,
    commissionBasisPoints,
    minimumPayoutPaise,
    payoutSchedule,
    payoutMode,
  } = body;
  const validPlan = (plan) => plan
    && Number.isSafeInteger(plan.pricePaise) && plan.pricePaise >= 0
    && Number.isInteger(plan.durationMonths) && plan.durationMonths > 0
    && Number.isInteger(plan.publicationLimit) && plan.publicationLimit > 0;

  if (!validPlan(monthlyPlan) || !validPlan(yearlyPlan)) {
    return res.status(400).json({ message: 'Both plans require a non-negative integer pricePaise, positive durationMonths, and positive publicationLimit' });
  }
  if (typeof currency !== 'string' || !/^[A-Z]{3}$/.test(currency)) {
    return res.status(400).json({ message: 'currency must be a 3-letter uppercase code' });
  }
  if (!Number.isInteger(freePublicationLimit) || freePublicationLimit < 0) {
    return res.status(400).json({ message: 'freePublicationLimit must be a non-negative integer' });
  }
  if (!Number.isInteger(commissionBasisPoints) || commissionBasisPoints < 0 || commissionBasisPoints > 10000) {
    return res.status(400).json({ message: 'commissionBasisPoints must be between 0 and 10000' });
  }
  if (!Number.isSafeInteger(minimumPayoutPaise) || minimumPayoutPaise < 0) {
    return res.status(400).json({ message: 'minimumPayoutPaise must be a non-negative integer' });
  }
  if (!['weekly', 'monthly', 'quarterly', 'on_demand'].includes(payoutSchedule)) {
    return res.status(400).json({ message: 'Unsupported payoutSchedule' });
  }
  if (!['manual', 'manual_batch'].includes(payoutMode)) {
    return res.status(400).json({ message: 'Payout execution must remain manual' });
  }

  try {
    const currentSettings = await getSettings();
    if (currency !== currentSettings.currency) {
      const [ledgerExists, subscriptionsExist, purchasesExist, payoutsExist, pricedExamsExist] = await Promise.all([
        FinancialLedgerEntry.exists({}),
        Subscription.exists({}),
        ExamPurchase.exists({}),
        Payout.exists({}),
        Exam.exists({ pricePaise: { $gt: 0 } }),
      ]);
      if (ledgerExists || subscriptionsExist || purchasesExist || payoutsExist || pricedExamsExist) {
        return res.status(409).json({ message: 'Currency cannot change after subscriptions, purchases, payouts, priced exams, or ledger entries exist' });
      }
    }
    const settings = await MonetizationSettings.findByIdAndUpdate(
      'platform',
      {
        $set: {
          monthlyPlan,
          yearlyPlan,
          currency,
          freePublicationLimit,
          commissionBasisPoints,
          minimumPayoutPaise,
          payoutSchedule,
          payoutMode,
          updatedBy: req.user._id,
        },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    return res.status(200).json(settings);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update monetization settings', error: error.message });
  }
};

const listFinanceRecords = async (req, res) => {
  try {
    const [subscriptions, purchases, payouts, entries, groupedEntries, paidPayouts, publicationEvents] = await Promise.all([
      Subscription.find().populate('instituteId', 'name').sort({ createdAt: -1 }).limit(100),
      ExamPurchase.find({ status: { $in: ['pending', 'verified'] } }).populate('buyerId', 'name email').populate('examId', 'title').sort({ createdAt: -1 }).limit(100),
      Payout.find({ status: { $in: ['pending', 'approved', 'processing'] } }).populate('instituteId', 'name').sort({ createdAt: 1 }),
      FinancialLedgerEntry.find().sort({ createdAt: -1 }).limit(200),
      FinancialLedgerEntry.aggregate([
        {
          $group: {
            _id: '$type',
            totalPaise: { $sum: '$amountPaise' },
            commissionablePaise: { $sum: '$commissionableAmountPaise' },
          },
        },
      ]),
      Payout.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: '$currency', totalPaise: { $sum: '$amountPaise' }, count: { $sum: 1 } } },
      ]),
      PublicationEvent.find().populate('instituteId', 'name').populate('examId', 'title').sort({ createdAt: -1 }).limit(200),
    ]);
    const totals = Object.fromEntries(groupedEntries.map((entry) => [entry._id, entry]));
    return res.status(200).json({
      subscriptions,
      purchases,
      payouts,
      entries,
      publicationEvents,
      totals: {
        grossExamSalesPaise: totals.purchase?.totalPaise || 0,
        subscriptionRevenuePaise: totals.subscription_payment?.totalPaise || 0,
        platformCommissionPaise: totals.platform_commission?.totalPaise || 0,
        netPlatformRevenuePaise: (totals.platform_commission?.totalPaise || 0)
          + (totals.subscription_payment?.totalPaise || 0),
        instituteShareAccruedPaise: totals.institute_share?.totalPaise || 0,
        institutePayableBalancePaise: [
          'institute_share',
          'refund',
          'chargeback',
          'gateway_fee',
          'tax',
          'payout',
          'payout_reversal',
        ].reduce((sum, type) => sum + (totals[type]?.totalPaise || 0), 0),
        refundsAndChargebacksPaise: Math.abs((totals.refund?.commissionablePaise || 0) + (totals.chargeback?.commissionablePaise || 0)),
        gatewayFeesPaise: totals.gateway_fee?.totalPaise || 0,
        taxesPaise: totals.tax?.totalPaise || 0,
        payoutsPaid: paidPayouts,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch finance records', error: error.message });
  }
};

const verifySubscriptionPayment = async (req, res) => {
  const { id } = req.params;
  const reference = typeof req.body?.paymentReference === 'string' ? req.body.paymentReference.trim() : '';
  if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid subscription id' });
  if (!reference) return res.status(400).json({ message: 'paymentReference is required to confirm verified payment' });

  const session = await mongoose.startSession();
  let subscription;
  try {
    await session.withTransaction(async () => {
      const pending = await Subscription.findOne({ _id: id, status: 'pending' }).session(session);
      if (!pending) {
        const err = new Error('Pending subscription not found');
        err.statusCode = 404;
        throw err;
      }
      const now = new Date();
      const endsAt = addCalendarMonths(now, pending.durationMonths);
      await Subscription.updateMany(
        { instituteId: pending.instituteId, status: 'active' },
        { $set: { status: 'expired' } },
        { session },
      );
      subscription = await Subscription.findOneAndUpdate(
        { _id: id, status: 'pending' },
        {
          $set: {
            status: 'active',
            startsAt: now,
            endsAt,
            paymentVerifiedAt: now,
            verifiedBy: req.user._id,
          },
          $unset: { pendingKey: 1 },
        },
        { new: true, session },
      );
      await FinancialLedgerEntry.create([{
        type: 'subscription_payment',
        instituteId: null,
        subscriptionId: pending._id,
        amountPaise: pending.pricePaise,
        currency: pending.currency,
        notes: 'Manual payment verified by SUPER_ADMIN',
        reference,
        createdBy: req.user._id,
      }], { session });
    });
    return res.status(200).json(subscription);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to verify subscription payment' });
  } finally {
    await session.endSession();
  }
};

const updateSubscriptionStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid subscription id' });
  if (!['past_due', 'expired'].includes(status)) {
    return res.status(400).json({ message: 'status must be past_due or expired' });
  }
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { _id: id, status: 'active' },
      { $set: { status } },
      { new: true, runValidators: true },
    );
    if (!subscription) return res.status(404).json({ message: 'Active subscription not found' });
    return res.status(200).json(subscription);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update subscription status', error: error.message });
  }
};

const verifyPurchasePayment = async (req, res) => {
  const { id } = req.params;
  const paymentReference = typeof req.body?.paymentReference === 'string' ? req.body.paymentReference.trim() : '';
  if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid purchase id' });
  if (!paymentReference) return res.status(400).json({ message: 'paymentReference is required to confirm verified payment' });
  try {
    return res.status(200).json(await verifyExamPurchase({ purchaseId: id, userId: req.user._id, paymentReference }));
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to verify purchase payment' });
  }
};

const adjustPurchase = async (req, res) => {
  const { id } = req.params;
  const { type, amountPaise, notes, reference } = req.body || {};
  if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid purchase id' });
  if (!['refund', 'chargeback', 'gateway_fee', 'tax'].includes(type)) {
    return res.status(400).json({ message: 'type must be refund, chargeback, gateway_fee, or tax' });
  }
  if (typeof notes !== 'string' || !notes.trim()) {
    return res.status(400).json({ message: 'notes are required for an auditable financial adjustment' });
  }
  try {
    return res.status(200).json(await addPurchaseAdjustment({
      purchaseId: id,
      type,
      amountPaise,
      notes: notes.trim(),
      reference: typeof reference === 'string' ? reference.trim() : '',
      userId: req.user._id,
    }));
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to record financial adjustment' });
  }
};

const reviewPayoutRequest = async (req, res) => {
  const { id } = req.params;
  const { status, confirmationReference = '', failureReason = '' } = req.body || {};
  if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid payout id' });
  try {
    return res.status(200).json(await reviewPayout({
      payoutId: id,
      status,
      userId: req.user._id,
      confirmationReference,
      failureReason,
    }));
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to update payout' });
  }
};

module.exports = {
  getMySubscription,
  requestSubscription,
  createExamPurchase,
  requestInstitutePayout,
  getInstituteFinance,
  getSettingsForAdmin,
  getPublicPlans,
  updateSettings,
  listFinanceRecords,
  verifySubscriptionPayment,
  updateSubscriptionStatus,
  verifyPurchasePayment,
  adjustPurchase,
  adjustSubscription,
  reviewPayoutRequest,
};
