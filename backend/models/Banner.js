import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    subtitle: String,

    image: String,

    link: String,

    position: {
      type: String,
      enum: ["home_top", "home_middle", "home_bottom", "shop_top"],
      default: "home_top",
    },

    order: {
      type: Number,
      default: 0,
    },

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

export default mongoose.model("Banner", bannerSchema);
