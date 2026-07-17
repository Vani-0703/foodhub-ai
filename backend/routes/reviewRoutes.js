import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getReviewsForRestaurant,
  addReview,
  replyToReview,
} from "../controllers/reviewController.js";

const router = express.Router();

router.get("/:restaurantId", getReviewsForRestaurant);
router.post("/:restaurantId", protect, addReview);
router.post("/:id/reply", protect, replyToReview);

export default router;
