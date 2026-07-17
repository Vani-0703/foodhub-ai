import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getMenuForRestaurant,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../controllers/menuController.js";

const router = express.Router();

router.get("/:restaurantId", getMenuForRestaurant);
router.post("/:restaurantId", protect, authorize("owner", "admin"), addMenuItem);
router.patch("/item/:id", protect, authorize("owner", "admin"), updateMenuItem);
router.delete("/item/:id", protect, authorize("owner", "admin"), deleteMenuItem);

export default router;
