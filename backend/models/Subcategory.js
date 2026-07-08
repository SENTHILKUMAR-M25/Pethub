import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    slug: String,

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    image: String,

    description: String,

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

subcategorySchema.index({ name: 1, category: 1 }, { unique: true });

export default mongoose.model("Subcategory", subcategorySchema);
