import express from "express";
import { protect, verifyFirebaseToken } from "../middleware/auth.js";
import {
  syncUser,
  getMe,
  requestOwnerRole,
  updateProfile,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/sync", verifyFirebaseToken, syncUser);
router.get("/me", protect, getMe);
router.patch("/role/owner", protect, requestOwnerRole);
router.patch("/profile", protect, updateProfile);

export default router;
