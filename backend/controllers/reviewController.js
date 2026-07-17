import Review from "../models/Review.js";
import Restaurant from "../models/Restaurant.js";

const recalcRestaurantRating = async (restaurantId) => {
  const stats = await Review.aggregate([
    { $match: { restaurant: restaurantId } },
    { $group: { _id: "$restaurant", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = stats[0] || {};
  await Restaurant.findByIdAndUpdate(restaurantId, {
    avgRating: Number(avg.toFixed(1)),
    numReviews: count,
  });
};

// GET /api/reviews/:restaurantId
export const getReviewsForRestaurant = async (req, res) => {
  const reviews = await Review.find({ restaurant: req.params.restaurantId })
    .populate("customer", "name photoURL")
    .sort({ createdAt: -1 });
  res.json(reviews);
};

// POST /api/reviews/:restaurantId
export const addReview = async (req, res) => {
  const { rating, comment, orderId } = req.body;
  const review = await Review.create({
    restaurant: req.params.restaurantId,
    customer: req.user._id,
    order: orderId,
    rating,
    comment,
  });
  await recalcRestaurantRating(req.params.restaurantId);
  res.status(201).json(review);
};

// POST /api/reviews/:id/reply  (owner replies to a review)
export const replyToReview = async (req, res) => {
  const review = await Review.findById(req.params.id).populate("restaurant");
  if (!review) return res.status(404).json({ message: "Review not found" });
  if (String(review.restaurant.owner) !== String(req.user._id) && req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  review.ownerReply = req.body.reply;
  await review.save();
  res.json(review);
};
