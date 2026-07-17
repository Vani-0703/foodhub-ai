import User from "../models/User.js";
import Restaurant from "../models/Restaurant.js";
import Order from "../models/Order.js";

// GET /api/admin/stats
export const getPlatformStats = async (req, res) => {
  const [userCount, restaurantCount, orderCount, revenueAgg] = await Promise.all([
    User.countDocuments(),
    Restaurant.countDocuments(),
    Order.countDocuments({ paymentStatus: "paid" }),
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
  ]);

  const ordersByDay = await Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
        revenue: { $sum: "$total" },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 30 },
  ]);

  const topRestaurants = await Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    { $group: { _id: "$restaurant", orders: { $sum: 1 }, revenue: { $sum: "$total" } } },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "restaurants",
        localField: "_id",
        foreignField: "_id",
        as: "restaurant",
      },
    },
    { $unwind: "$restaurant" },
  ]);

  res.json({
    userCount,
    restaurantCount,
    orderCount,
    totalRevenue: revenueAgg[0]?.total || 0,
    ordersByDay,
    topRestaurants,
  });
};

// GET /api/admin/restaurants/pending
export const getPendingRestaurants = async (req, res) => {
  const restaurants = await Restaurant.find({ isApproved: false }).populate("owner", "name email");
  res.json(restaurants);
};

// PATCH /api/admin/restaurants/:id/approve
export const approveRestaurant = async (req, res) => {
  const restaurant = await Restaurant.findByIdAndUpdate(
    req.params.id,
    { isApproved: true },
    { new: true }
  );
  if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
  res.json(restaurant);
};

// GET /api/admin/users
export const getAllUsers = async (req, res) => {
  const users = await User.find().select("-cuisinePreferences");
  res.json(users);
};

// PATCH /api/admin/users/:id/ban
export const toggleBanUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.isBanned = !user.isBanned;
  await user.save();
  res.json(user);
};
