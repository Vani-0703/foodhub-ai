import MenuItem from "../models/MenuItem.js";
import Restaurant from "../models/Restaurant.js";

const assertOwnership = async (restaurantId, user) => {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw { status: 404, message: "Restaurant not found" };
  if (String(restaurant.owner) !== String(user._id) && user.role !== "admin") {
    throw { status: 403, message: "Not your restaurant" };
  }
  return restaurant;
};

// GET /api/menu/:restaurantId
export const getMenuForRestaurant = async (req, res) => {
  const menu = await MenuItem.find({ restaurant: req.params.restaurantId });
  res.json(menu);
};

// POST /api/menu/:restaurantId
export const addMenuItem = async (req, res) => {
  try {
    await assertOwnership(req.params.restaurantId, req.user);
    const item = await MenuItem.create({ ...req.body, restaurant: req.params.restaurantId });
    res.status(201).json(item);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// PATCH /api/menu/item/:id
export const updateMenuItem = async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Menu item not found" });
  try {
    await assertOwnership(item.restaurant, req.user);
    Object.assign(item, req.body);
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// DELETE /api/menu/item/:id
export const deleteMenuItem = async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Menu item not found" });
  try {
    await assertOwnership(item.restaurant, req.user);
    await item.deleteOne();
    res.json({ message: "Menu item deleted" });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};
