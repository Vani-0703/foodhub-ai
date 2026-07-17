import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    image: { type: String, default: "" },
    category: { type: String, default: "Main" }, // Starter, Main, Dessert, Drink
    cuisine: { type: String, default: "" },
    isVeg: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
    tags: [{ type: String }], // e.g. spicy, popular, chef-special
    numOrders: { type: Number, default: 0 }, // used for "popular" + AI recs
  },
  { timestamps: true }
);

export default mongoose.model("MenuItem", menuItemSchema);
