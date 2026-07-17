import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: "" },
    ownerReply: { type: String, default: "" },
  },
  { timestamps: true }
);

reviewSchema.index({ restaurant: 1, customer: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
