const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    pricePaise: { type: Number, required: true, min: 0 },
    durationMonths: { type: Number, required: true, min: 1 },
    publicationLimit: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const monetizationSettingsSchema = new mongoose.Schema(
  {
    _id: { type: String, default: "platform" },
    currency: {
      type: String,
      required: true,
      default: "INR",
      uppercase: true,
      trim: true,
    },
    monthlyPlan: {
      type: planSchema,
      default: () => ({
        pricePaise: 49900,
        durationMonths: 1,
        publicationLimit: 20,
      }),
    },
    yearlyPlan: {
      type: planSchema,
      default: () => ({
        pricePaise: 499900,
        durationMonths: 12,
        publicationLimit: 240,
      }),
    },
    freePublicationLimit: { type: Number, default: 3, min: 0 },
    commissionBasisPoints: { type: Number, default: 2000, min: 0, max: 10000 },
    minimumPayoutPaise: { type: Number, default: 100000, min: 0 },
    payoutSchedule: {
      type: String,
      enum: ["weekly", "monthly", "quarterly", "on_demand"],
      default: "monthly",
    },
    payoutMode: {
      type: String,
      enum: ["manual", "manual_batch"],
      default: "manual",
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model(
  "MonetizationSettings",
  monetizationSettingsSchema,
);
