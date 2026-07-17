import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  createOrder,
  getMyOrders,
  getRestaurantOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/mine", protect, getMyOrders);
router.get("/restaurant/:restaurantId", protect, authorize("owner", "admin"), getRestaurantOrders);
router.get("/:id", protect, getOrderById);
router.patch("/:id/status", protect, authorize("owner", "admin"), updateOrderStatus);

export default router;
