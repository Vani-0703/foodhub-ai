import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getPersonalizedRecommendations,
  getTrending,
  getSimilarRestaurants,
} from "../controllers/recommendationController.js";

const router = express.Router();

router.get("/", protect, getPersonalizedRecommendations);
router.get("/trending", getTrending);
router.get("/similar/:restaurantId", getSimilarRestaurants);

export default router;
