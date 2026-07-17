import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getPlatformStats,
  getPendingRestaurants,
  approveRestaurant,
  getAllUsers,
  toggleBanUser,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/stats", getPlatformStats);
router.get("/restaurants/pending", getPendingRestaurants);
router.patch("/restaurants/:id/approve", approveRestaurant);
router.get("/users", getAllUsers);
router.patch("/users/:id/ban", toggleBanUser);

export default router;
