const mongoose = require("mongoose");
const Institute = require("../models/Institute");
const ExamPurchase = require("../models/ExamPurchase");
const Subscription = require("../models/Subscription");
const FinancialLedgerEntry = require("../models/FinancialLedgerEntry");
const Payout = require("../models/Payout");
const MonetizationSettings = require("../models/MonetizationSettings");
const {
  calculateCommission,
  calculateRefundSplit,
  calculateAvailablePayoutPaise,
} = require("../utils/financialCalculations");

const createLedgerEntry = (entry, session) =>
  FinancialLedgerEntry.create([entry], { session });

const lockInstituteBalance = (instituteId, session) =>
  Institute.findOneAndUpdate(
    { _id: instituteId },
    { $inc: { payoutBalanceVersion: 1 } },
    { new: true, session },
  );

const getAvailableBalance = async (instituteId, session) => {
  let query = FinancialLedgerEntry.find({ instituteId });
  if (session) query = query.session(session);
  const entries = await query;
  return calculateAvailablePayoutPaise(entries);
};

const getScheduledPayoutDate = (schedule, from = new Date()) => {
  const date = new Date(from);
  if (schedule === "on_demand") return date;
  if (schedule === "weekly") {
    const daysUntilNextMonday = (8 - date.getUTCDay()) % 7 || 7;
    date.setUTCDate(date.getUTCDate() + daysUntilNextMonday);
    date.setUTCHours(0, 0, 0, 0);
    return date;
  }
  if (schedule === "quarterly") {
    const nextQuarterMonth = Math.floor(date.getUTCMonth() / 3) * 3 + 3;
    return new Date(Date.UTC(date.getUTCFullYear(), nextQuarterMonth, 1));
  }
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
};

const verifyExamPurchase = async ({ purchaseId, userId, paymentReference }) => {
  const session = await mongoose.startSession();
  let updatedPurchase;
  try {
    await session.withTransaction(async () => {
      const purchase = await ExamPurchase.findOneAndUpdate(
        { _id: purchaseId, status: "pending" },
        {
          $set: {
            status: "verified",
            verifiedAt: new Date(),
            verifiedBy: userId,
            paymentReference,
          },
        },
        { new: true, session },
      );
      if (!purchase) {
        const err = new Error("Pending purchase not found");
        err.statusCode = 404;
        throw err;
      }
      updatedPurchase = purchase;

      const settings =
        await MonetizationSettings.findById("platform").session(session);
      const rate =
        purchase.commissionBasisPoints ??
        settings?.commissionBasisPoints ??
        2000;
      const split = purchase.instituteId
        ? calculateCommission(purchase.amountPaise, rate)
        : { platformSharePaise: purchase.amountPaise, instituteSharePaise: 0 };
      const currency = purchase.currency;

      await createLedgerEntry(
        {
          type: "purchase",
          instituteId: purchase.instituteId,
          examId: purchase.examId,
          purchaseId: purchase._id,
          amountPaise: purchase.amountPaise,
          commissionableAmountPaise: purchase.amountPaise,
          currency,
          reference: paymentReference,
          createdBy: userId,
        },
        session,
      );
      await createLedgerEntry(
        {
          type: "platform_commission",
          instituteId: purchase.instituteId,
          examId: purchase.examId,
          purchaseId: purchase._id,
          amountPaise: split.platformSharePaise,
          commissionableAmountPaise: purchase.amountPaise,
          currency,
          reference: paymentReference,
          createdBy: userId,
          notes: purchase.instituteId
            ? "Platform commission"
            : "Platform-owned exam revenue",
        },
        session,
      );
      if (purchase.instituteId && split.instituteSharePaise > 0) {
        await createLedgerEntry(
          {
            type: "institute_share",
            instituteId: purchase.instituteId,
            examId: purchase.examId,
            purchaseId: purchase._id,
            amountPaise: split.instituteSharePaise,
            commissionableAmountPaise: purchase.amountPaise,
            currency,
            reference: paymentReference,
            createdBy: userId,
          },
          session,
        );
      }
    });
    return updatedPurchase;
  } finally {
    await session.endSession();
  }
};

const addSubscriptionAdjustment = async ({
  subscriptionId,
  type,
  amountPaise,
  notes,
  reference,
  userId,
}) => {
  const session = await mongoose.startSession();
  try {
    let updated;
    await session.withTransaction(async () => {
      const subscription = await Subscription.findOne({
        _id: subscriptionId,
        paymentVerifiedAt: { $ne: null },
      }).session(session);
      if (!subscription) {
        const err = new Error("Payment-verified subscription not found");
        err.statusCode = 404;
        throw err;
      }
      if (!Number.isSafeInteger(amountPaise) || amountPaise < 1) {
        const err = new Error("amountPaise must be a positive integer");
        err.statusCode = 400;
        throw err;
      }

      const entry = {
        type,
        instituteId: null,
        subscriptionId: subscription._id,
        currency: subscription.currency,
        amountPaise: -amountPaise,
        commissionableAmountPaise:
          type === "refund" || type === "chargeback" ? -amountPaise : 0,
        notes,
        reference,
        createdBy: userId,
      };
      if (type === "refund" || type === "chargeback") {
        const refunded = subscription.refundedPaise + amountPaise;
        if (refunded > subscription.pricePaise) {
          const err = new Error(
            "Refund or chargeback cannot exceed the subscription payment",
          );
          err.statusCode = 400;
          throw err;
        }
        await createLedgerEntry(entry, session);
        await createLedgerEntry(
          {
            ...entry,
            type: "platform_commission",
            commissionableAmountPaise: 0,
            notes: `Subscription ${type}: ${notes}`,
          },
          session,
        );
        updated = await Subscription.findByIdAndUpdate(
          subscription._id,
          {
            $inc: { refundedPaise: amountPaise },
            ...(refunded === subscription.pricePaise
              ? { $set: { status: "expired" } }
              : {}),
          },
          { new: true, session },
        );
      } else if (type === "gateway_fee" || type === "tax") {
        await createLedgerEntry(entry, session);
        await createLedgerEntry(
          {
            ...entry,
            type: "platform_commission",
            commissionableAmountPaise: 0,
            notes: `Subscription ${type}: ${notes}`,
          },
          session,
        );
        updated = subscription;
      } else {
        const err = new Error(
          "Adjustment type must be refund, chargeback, gateway_fee, or tax",
        );
        err.statusCode = 400;
        throw err;
      }
    });
    return updated;
  } finally {
    await session.endSession();
  }
};

const addPurchaseAdjustment = async ({
  purchaseId,
  type,
  amountPaise,
  notes,
  reference,
  userId,
}) => {
  const session = await mongoose.startSession();
  try {
    let updated;
    await session.withTransaction(async () => {
      const purchase = await ExamPurchase.findOne({
        _id: purchaseId,
        status: "verified",
      }).session(session);
      if (!purchase) {
        const err = new Error("Verified purchase not found");
        err.statusCode = 404;
        throw err;
      }
      if (!Number.isSafeInteger(amountPaise) || amountPaise < 1) {
        const err = new Error("amountPaise must be a positive integer");
        err.statusCode = 400;
        throw err;
      }

      const entryBase = {
        instituteId: purchase.instituteId,
        examId: purchase.examId,
        purchaseId: purchase._id,
        currency: purchase.currency,
        amountPaise,
        notes,
        reference,
        createdBy: userId,
      };

      if (type === "refund" || type === "chargeback") {
        const newTotalRefund = purchase.refundedPaise + amountPaise;
        if (newTotalRefund > purchase.amountPaise) {
          const err = new Error(
            "Refund cannot exceed the original purchase amount",
          );
          err.statusCode = 400;
          throw err;
        }
        const settings =
          await MonetizationSettings.findById("platform").session(session);
        const rate =
          purchase.commissionBasisPoints ??
          settings?.commissionBasisPoints ??
          2000;
        const previousSplit = purchase.instituteId
          ? calculateRefundSplit(
              purchase.amountPaise,
              purchase.refundedPaise,
              rate,
            )
          : {
              platformSharePaise: purchase.refundedPaise,
              instituteSharePaise: 0,
            };
        const updatedSplit = purchase.instituteId
          ? calculateRefundSplit(purchase.amountPaise, newTotalRefund, rate)
          : { platformSharePaise: newTotalRefund, instituteSharePaise: 0 };
        const instituteRefundPaise =
          updatedSplit.instituteSharePaise - previousSplit.instituteSharePaise;
        const platformRefundPaise =
          updatedSplit.platformSharePaise - previousSplit.platformSharePaise;
        await createLedgerEntry(
          {
            ...entryBase,
            type,
            amountPaise: -instituteRefundPaise,
            commissionableAmountPaise: -amountPaise,
          },
          session,
        );
        if (platformRefundPaise > 0) {
          await createLedgerEntry(
            {
              ...entryBase,
              type: "platform_commission",
              amountPaise: -platformRefundPaise,
              commissionableAmountPaise: -amountPaise,
              notes: `Commission reversed: ${notes}`,
            },
            session,
          );
        }
        updated = await ExamPurchase.findByIdAndUpdate(
          purchase._id,
          {
            $inc: { refundedPaise: amountPaise },
            $set: {
              status:
                newTotalRefund === purchase.amountPaise
                  ? "refunded"
                  : "verified",
            },
            ...(newTotalRefund === purchase.amountPaise
              ? { $unset: { activeKey: 1 } }
              : {}),
          },
          { new: true, session },
        );
      } else if (type === "gateway_fee" || type === "tax") {
        await createLedgerEntry(
          { ...entryBase, amountPaise: -amountPaise, type },
          session,
        );
        if (!purchase.instituteId) {
          await createLedgerEntry(
            {
              ...entryBase,
              type: "platform_commission",
              amountPaise: -amountPaise,
              notes: `Platform-owned exam ${type}: ${notes}`,
            },
            session,
          );
        }
        updated = purchase;
      } else {
        const err = new Error(
          "Adjustment type must be refund, chargeback, gateway_fee, or tax",
        );
        err.statusCode = 400;
        throw err;
      }
    });
    return updated;
  } finally {
    await session.endSession();
  }
};

const requestPayout = async ({ instituteId, userId, amountPaise }) => {
  const session = await mongoose.startSession();
  try {
    let payout;
    await session.withTransaction(async () => {
      const settings =
        await MonetizationSettings.findById("platform").session(session);
      if (!settings)
        throw new Error("Monetization settings are not configured");
      await lockInstituteBalance(instituteId, session);
      const available = await getAvailableBalance(instituteId, session);
      if (
        !Number.isSafeInteger(amountPaise) ||
        amountPaise < settings.minimumPayoutPaise
      ) {
        const err = new Error(
          `Payout must be at least ${settings.minimumPayoutPaise} paise`,
        );
        err.statusCode = 400;
        throw err;
      }
      if (amountPaise > available) {
        const err = new Error("Payout amount exceeds the available balance");
        err.statusCode = 400;
        throw err;
      }
      payout = (
        await Payout.create(
          [
            {
              instituteId,
              amountPaise,
              currency: settings.currency,
              status: "pending",
              requestedAt: new Date(),
              scheduledFor: getScheduledPayoutDate(settings.payoutSchedule),
            },
          ],
          { session },
        )
      )[0];
    });
    return payout;
  } finally {
    await session.endSession();
  }
};

const reviewPayout = async ({
  payoutId,
  status,
  userId,
  confirmationReference = "",
  failureReason = "",
}) => {
  const session = await mongoose.startSession();
  try {
    let payout;
    await session.withTransaction(async () => {
      const current = await Payout.findById(payoutId).session(session);
      if (!current) {
        const err = new Error("Payout not found");
        err.statusCode = 404;
        throw err;
      }

      if (status === "approved") {
        if (current.status !== "pending") {
          const err = new Error("Only pending payouts can be approved");
          err.statusCode = 409;
          throw err;
        }
        if (current.scheduledFor > new Date()) {
          const err = new Error(
            `Payout is scheduled for ${current.scheduledFor.toISOString()}`,
          );
          err.statusCode = 409;
          throw err;
        }
        await lockInstituteBalance(current.instituteId, session);
        const available = await getAvailableBalance(
          current.instituteId,
          session,
        );
        if (current.amountPaise > available) {
          const err = new Error("Payout amount exceeds the available balance");
          err.statusCode = 409;
          throw err;
        }
        await createLedgerEntry(
          {
            type: "payout",
            payoutId: current._id,
            instituteId: current.instituteId,
            amountPaise: -current.amountPaise,
            currency: current.currency,
            createdBy: userId,
            notes: "Payout approved and balance reserved",
          },
          session,
        );
        payout = await Payout.findByIdAndUpdate(
          current._id,
          {
            $set: {
              status: "approved",
              reviewedBy: userId,
              reviewedAt: new Date(),
            },
          },
          { new: true, session },
        );
      } else if (status === "processing") {
        if (current.status !== "approved") {
          const err = new Error("Only approved payouts can enter processing");
          err.statusCode = 409;
          throw err;
        }
        payout = await Payout.findByIdAndUpdate(
          current._id,
          {
            $set: {
              status: "processing",
              reviewedBy: userId,
              reviewedAt: new Date(),
            },
          },
          { new: true, session },
        );
      } else if (status === "paid") {
        if (current.status !== "processing" || !confirmationReference.trim()) {
          const err = new Error(
            "Payout must be processing and have a confirmation reference before marking paid",
          );
          err.statusCode = 400;
          throw err;
        }
        payout = await Payout.findByIdAndUpdate(
          current._id,
          {
            $set: {
              status: "paid",
              confirmationReference: confirmationReference.trim(),
              paidAt: new Date(),
              reviewedBy: userId,
              reviewedAt: new Date(),
            },
          },
          { new: true, session },
        );
      } else if (status === "failed") {
        if (
          !["approved", "processing"].includes(current.status) ||
          !failureReason.trim()
        ) {
          const err = new Error(
            "Only approved or processing payouts can fail; failureReason is required",
          );
          err.statusCode = 400;
          throw err;
        }
        await createLedgerEntry(
          {
            type: "payout_reversal",
            payoutId: current._id,
            instituteId: current.instituteId,
            amountPaise: current.amountPaise,
            currency: current.currency,
            createdBy: userId,
            notes: failureReason.trim(),
          },
          session,
        );
        payout = await Payout.findByIdAndUpdate(
          current._id,
          {
            $set: {
              status: "failed",
              failureReason: failureReason.trim(),
              reviewedBy: userId,
              reviewedAt: new Date(),
            },
          },
          { new: true, session },
        );
      } else {
        const err = new Error("Unsupported payout status");
        err.statusCode = 400;
        throw err;
      }
    });
    return payout;
  } finally {
    await session.endSession();
  }
};

module.exports = {
  verifyExamPurchase,
  addPurchaseAdjustment,
  addSubscriptionAdjustment,
  requestPayout,
  reviewPayout,
  getAvailableBalance,
  getScheduledPayoutDate,
};
