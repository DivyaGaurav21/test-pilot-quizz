const mongoose = require("mongoose");

const payoutSchema = new mongoose.Schema(
  {
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
      index: true,
    },
    amountPaise: { type: Number, required: true, min: 1 },
    currency: { type: String, required: true, uppercase: true },
    status: {
      type: String,
      enum: ["pending", "approved", "processing", "paid", "failed"],
      default: "pending",
      required: true,
    },
    requestedAt: { type: Date, default: Date.now },
    scheduledFor: { type: Date, required: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    paidAt: Date,
    confirmationReference: { type: String, trim: true, default: "" },
    failureReason: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payout", payoutSchema);
