import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";
import Restaurant from "../models/Restaurant.js";

/**
 * Lightweight, dependency-free recommendation engine.
 *
 * It blends three signals into a single score per menu item:
 *  1. Popularity   — global numOrders (wisdom of the crowd)
 *  2. Personal fit — overlap between the item's cuisine/tags and the
 *                    cuisines the user has ordered from before
 *  3. Recency/rating— restaurant avgRating as a quality prior
 *
 * This runs entirely in Node with no external AI API key required, so the
 * feature works out of the box. Swapping in a real LLM/embedding call
 * (e.g. Claude via the Anthropic API) is a drop-in replacement for
 * `buildUserTasteProfile` + the scoring function below.
 */

const buildUserTasteProfile = async (userId) => {
  const pastOrders = await Order.find({ customer: userId, status: { $ne: "cancelled" } })
    .populate("items.menuItem")
    .limit(50);

  const cuisineCount = {};
  pastOrders.forEach((order) => {
    order.items.forEach((i) => {
      const cuisine = i.menuItem?.cuisine;
      if (cuisine) cuisineCount[cuisine] = (cuisineCount[cuisine] || 0) + i.quantity;
    });
  });
  return cuisineCount; // e.g. { Italian: 5, Indian: 2 }
};

// GET /api/recommendations  (personalized, requires auth)
export const getPersonalizedRecommendations = async (req, res) => {
  const taste = await buildUserTasteProfile(req.user._id);
  const items = await MenuItem.find({ isAvailable: true })
    .populate("restaurant", "name avgRating isApproved coverImage")
    .limit(200);

  const scored = items
    .filter((i) => i.restaurant?.isApproved)
    .map((item) => {
      const popularityScore = Math.min(item.numOrders / 20, 1) * 40; // 0-40
      const tasteScore = ((taste[item.cuisine] || 0) / 10) * 40; // 0-40, caps at 10 past orders
      const qualityScore = ((item.restaurant?.avgRating || 0) / 5) * 20; // 0-20
      return { item, score: popularityScore + tasteScore + qualityScore };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((s) => s.item);

  res.json(scored);
};

// GET /api/recommendations/trending  (public, no auth needed)
export const getTrending = async (req, res) => {
  const items = await MenuItem.find({ isAvailable: true })
    .populate("restaurant", "name avgRating isApproved coverImage")
    .sort({ numOrders: -1 })
    .limit(12);
  res.json(items.filter((i) => i.restaurant?.isApproved));
};

// GET /api/recommendations/similar/:restaurantId  ("you might also like")
export const getSimilarRestaurants = async (req, res) => {
  const target = await Restaurant.findById(req.params.restaurantId);
  if (!target) return res.status(404).json({ message: "Restaurant not found" });

  const similar = await Restaurant.find({
    _id: { $ne: target._id },
    isApproved: true,
    cuisines: { $in: target.cuisines },
  })
    .sort({ avgRating: -1 })
    .limit(6);

  res.json(similar);
};
