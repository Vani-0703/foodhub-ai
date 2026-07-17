// Run with: npm run seed
// Populates a few demo restaurants + menu items so the UI has data to show.
// Note: users are created via Firebase Auth + /api/auth/sync, not here.
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Restaurant from "../models/Restaurant.js";
import MenuItem from "../models/MenuItem.js";
import User from "../models/User.js";

dotenv.config();

const run = async () => {
  await connectDB();

  let demoOwner = await User.findOne({ email: "demo-owner@foodhub.ai" });
  if (!demoOwner) {
    demoOwner = await User.create({
      firebaseUid: "demo-owner-uid",
      name: "Demo Owner",
      email: "demo-owner@foodhub.ai",
      role: "owner",
    });
  }

  await Restaurant.deleteMany({ owner: demoOwner._id });

  const restaurants = await Restaurant.insertMany([
    {
      owner: demoOwner._id,
      name: "Bella Italia",
      description: "Authentic wood-fired pizza and handmade pasta.",
      cuisines: ["Italian", "Pizza"],
      coverImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
      address: { line1: "12 Main St", city: "Springfield", state: "IL", zip: "62701" },
      priceRange: 2,
      isApproved: true,
      isFeatured: true,
      avgRating: 4.6,
      numReviews: 128,
    },
    {
      owner: demoOwner._id,
      name: "Spice Route",
      description: "Modern Indian cuisine with bold, vibrant flavors.",
      cuisines: ["Indian"],
      coverImage: "https://images.unsplash.com/photo-1585937421612-70a008356fbe",
      address: { line1: "88 Curry Ln", city: "Springfield", state: "IL", zip: "62701" },
      priceRange: 2,
      isApproved: true,
      avgRating: 4.4,
      numReviews: 76,
    },
    {
      owner: demoOwner._id,
      name: "Dragon Wok",
      description: "Fast, fresh Chinese-American favorites.",
      cuisines: ["Chinese"],
      coverImage: "https://images.unsplash.com/photo-1552566626-52f8b828add9",
      address: { line1: "5 Noodle Ave", city: "Springfield", state: "IL", zip: "62701" },
      priceRange: 1,
      isApproved: true,
      avgRating: 4.1,
      numReviews: 54,
    },
  ]);

  const menuItems = [
    { restaurant: restaurants[0]._id, name: "Margherita Pizza", price: 13.99, cuisine: "Italian", category: "Main", tags: ["popular"] },
    { restaurant: restaurants[0]._id, name: "Fettuccine Alfredo", price: 15.5, cuisine: "Italian", category: "Main" },
    { restaurant: restaurants[0]._id, name: "Tiramisu", price: 6.99, cuisine: "Italian", category: "Dessert" },
    { restaurant: restaurants[1]._id, name: "Butter Chicken", price: 14.5, cuisine: "Indian", category: "Main", isVeg: false, tags: ["popular", "spicy"] },
    { restaurant: restaurants[1]._id, name: "Paneer Tikka", price: 12.0, cuisine: "Indian", category: "Starter" },
    { restaurant: restaurants[1]._id, name: "Garlic Naan", price: 3.5, cuisine: "Indian", category: "Main" },
    { restaurant: restaurants[2]._id, name: "Kung Pao Chicken", price: 11.99, cuisine: "Chinese", category: "Main", isVeg: false },
    { restaurant: restaurants[2]._id, name: "Vegetable Spring Rolls", price: 6.5, cuisine: "Chinese", category: "Starter" },
  ];
  await MenuItem.insertMany(menuItems);

  console.log("Seed complete ✅");
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
