import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getMyRestaurants,
} from "../controllers/restaurantController.js";

const router = express.Router();

router.get("/", getRestaurants);
router.get("/owner/mine", protect, authorize("owner", "admin"), getMyRestaurants);
router.get("/:id", getRestaurantById);
router.post("/", protect, authorize("owner", "admin"), createRestaurant);
router.patch("/:id", protect, authorize("owner", "admin"), updateRestaurant);
router.delete("/:id", protect, authorize("owner", "admin"), deleteRestaurant);

export default router;
