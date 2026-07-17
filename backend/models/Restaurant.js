import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    logo: { type: String, default: "" },
    cuisines: [{ type: String }],
    address: {
      line1: String,
      city: String,
      state: String,
      zip: String,
      lat: Number,
      lng: Number,
    },
    priceRange: { type: Number, min: 1, max: 4, default: 2 }, // $ to $$$$
    avgRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isOpen: { type: Boolean, default: true },
    openingHours: { type: String, default: "9:00 AM - 10:00 PM" },
    deliveryFee: { type: Number, default: 2.99 },
    minOrder: { type: Number, default: 10 },
    estimatedDeliveryTime: { type: Number, default: 30 }, // minutes
    isApproved: { type: Boolean, default: false }, // admin must approve
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

restaurantSchema.index({ name: "text", cuisines: "text", description: "text" });

export default mongoose.model("Restaurant", restaurantSchema);
