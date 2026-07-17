import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";
import Restaurant from "../models/Restaurant.js";
import User from "../models/User.js";
import { getIO } from "../utils/socket.js";

// POST /api/orders  — creates an order in "pending_payment" before Stripe checkout
export const createOrder = async (req, res) => {
  const { restaurantId, items, deliveryAddress } = req.body;
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

  const menuItems = await MenuItem.find({ _id: { $in: items.map((i) => i.menuItem) } });
  let subtotal = 0;
  const orderItems = items.map((i) => {
    const menuItem = menuItems.find((m) => String(m._id) === i.menuItem);
    if (!menuItem) throw new Error("Invalid menu item in cart");
    subtotal += menuItem.price * i.quantity;
    return {
      menuItem: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: i.quantity,
    };
  });

  const deliveryFee = restaurant.deliveryFee;
  const tax = Number((subtotal * 0.08).toFixed(2));
  const total = Number((subtotal + deliveryFee + tax).toFixed(2));

  const order = await Order.create({
    customer: req.user._id,
    restaurant: restaurant._id,
    items: orderItems,
    subtotal,
    deliveryFee,
    tax,
    total,
    deliveryAddress,
    status: "pending_payment",
    statusHistory: [{ status: "pending_payment" }],
  });

  res.status(201).json(order);
};

// GET /api/orders/mine  (customer)
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ customer: req.user._id })
    .populate("restaurant", "name coverImage")
    .sort({ createdAt: -1 });
  res.json(orders);
};

// GET /api/orders/restaurant/:restaurantId  (owner)
export const getRestaurantOrders = async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.restaurantId);
  if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
  if (String(restaurant.owner) !== String(req.user._id) && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not your restaurant" });
  }
  const orders = await Order.find({ restaurant: restaurant._id })
    .populate("customer", "name phone")
    .sort({ createdAt: -1 });
  res.json(orders);
};

// GET /api/orders/:id
export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("restaurant", "name coverImage owner")
    .populate("customer", "name phone");
  if (!order) return res.status(404).json({ message: "Order not found" });

  const isCustomer = String(order.customer._id) === String(req.user._id);
  const isOwner = String(order.restaurant.owner) === String(req.user._id);
  if (!isCustomer && !isOwner && req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  res.json(order);
};

// PATCH /api/orders/:id/status  (owner moves order through the pipeline)
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id).populate("restaurant");
  if (!order) return res.status(404).json({ message: "Order not found" });

  if (String(order.restaurant.owner) !== String(req.user._id) && req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  order.status = status;
  order.statusHistory.push({ status });
  await order.save();

  // Update numOrders for AI recommendation signal + cuisine preference
  if (status === "placed") {
    await MenuItem.updateMany(
      { _id: { $in: order.items.map((i) => i.menuItem) } },
      { $inc: { numOrders: 1 } }
    );
  }

  // Real-time push to the customer's order tracking page
  getIO()?.to(`order_${order._id}`).emit("order_status_updated", {
    orderId: order._id,
    status: order.status,
  });

  res.json(order);
};
