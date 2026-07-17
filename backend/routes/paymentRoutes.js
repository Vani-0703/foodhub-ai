import express from "express";
import { protect } from "../middleware/auth.js";
import { createPaymentIntent } from "../controllers/paymentController.js";

// Note: the webhook route is registered separately in server.js because it
// needs the RAW request body (not JSON-parsed) to verify the Stripe signature.
const router = express.Router();

router.post("/create-intent", protect, createPaymentIntent);

export default router;
