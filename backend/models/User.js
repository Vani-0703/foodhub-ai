import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    photoURL: { type: String, default: "" },
    role: {
      type: String,
      enum: ["customer", "owner", "admin"],
      default: "customer",
    },
    phone: { type: String, default: "" },
    addresses: [
      {
        label: String,
        line1: String,
        city: String,
        state: String,
        zip: String,
        lat: Number,
        lng: Number,
      },
    ],
    favoriteRestaurants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
    ],
    // lightweight signal used by the recommendation engine
    cuisinePreferences: { type: Map, of: Number, default: {} },
    isBanned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
