const mongoose = require("mongoose");

const examPurchaseSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      default: null,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "refunded"],
      default: "pending",
    },
    amountPaise: { type: Number, required: true, min: 1 },
    commissionBasisPoints: { type: Number, required: true, min: 0, max: 10000 },
    refundedPaise: { type: Number, default: 0, min: 0 },
    currency: { type: String, required: true, uppercase: true },
    activeKey: { type: String, unique: true, sparse: true },
    paymentReference: { type: String, trim: true, default: "" },
    verifiedAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ExamPurchase", examPurchaseSchema);
