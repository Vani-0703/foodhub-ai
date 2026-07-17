import Restaurant from "../models/Restaurant.js";
import MenuItem from "../models/MenuItem.js";

// GET /api/restaurants?search=&cuisine=&sort=rating&page=1
export const getRestaurants = async (req, res) => {
  const { search, cuisine, sort, page = 1, limit = 12 } = req.query;
  const query = { isApproved: true };

  if (search) query.$text = { $search: search };
  if (cuisine) query.cuisines = cuisine;

  let sortOption = { isFeatured: -1, avgRating: -1 };
  if (sort === "delivery_time") sortOption = { estimatedDeliveryTime: 1 };
  if (sort === "price_low") sortOption = { priceRange: 1 };
  if (sort === "price_high") sortOption = { priceRange: -1 };

  const skip = (Number(page) - 1) * Number(limit);
  const [restaurants, total] = await Promise.all([
    Restaurant.find(query).sort(sortOption).skip(skip).limit(Number(limit)),
    Restaurant.countDocuments(query),
  ]);

  res.json({ restaurants, total, page: Number(page), pages: Math.ceil(total / limit) });
};

// GET /api/restaurants/:id
export const getRestaurantById = async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
  const menu = await MenuItem.find({ restaurant: restaurant._id, isAvailable: true });
  res.json({ restaurant, menu });
};

// POST /api/restaurants  (owner)
export const createRestaurant = async (req, res) => {
  const restaurant = await Restaurant.create({ ...req.body, owner: req.user._id });
  res.status(201).json(restaurant);
};

// PATCH /api/restaurants/:id  (owner of that restaurant only)
export const updateRestaurant = async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
  if (String(restaurant.owner) !== String(req.user._id) && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not your restaurant" });
  }
  Object.assign(restaurant, req.body);
  await restaurant.save();
  res.json(restaurant);
};

// DELETE /api/restaurants/:id
export const deleteRestaurant = async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
  if (String(restaurant.owner) !== String(req.user._id) && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not your restaurant" });
  }
  await restaurant.deleteOne();
  await MenuItem.deleteMany({ restaurant: restaurant._id });
  res.json({ message: "Restaurant deleted" });
};

// GET /api/restaurants/owner/mine
export const getMyRestaurants = async (req, res) => {
  const restaurants = await Restaurant.find({ owner: req.user._id });
  res.json(restaurants);
};
