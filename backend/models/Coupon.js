import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    description: String,

    type: {
      type: String,
      enum: ["percent", "flat", "freeship"],
      default: "percent",
    },

    value: {
      type: Number,
      required: true,
      min: 0,
    },

    minOrder: {
      type: Number,
      default: 0,
    },

    maxDiscount: {
      type: Number,
      default: 0,
    },

    usageLimit: {
      type: Number,
      default: 0,
    },

    usedCount: {
      type: Number,
      default: 0,
    },

    startDate: Date,

    endDate: Date,

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Coupon", couponSchema);
