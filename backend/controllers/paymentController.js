import Stripe from "stripe";
import Order from "../models/Order.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/payments/create-intent  { orderId }
export const createPaymentIntent = async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (String(order.customer) !== String(req.user._id)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.total * 100), // cents
    currency: "usd",
    metadata: { orderId: String(order._id) },
    automatic_payment_methods: { enabled: true },
  });

  order.stripePaymentIntentId = paymentIntent.id;
  await order.save();

  res.json({ clientSecret: paymentIntent.client_secret });
};

// Stripe webhook: POST /api/payments/webhook (raw body — configured in server.js)
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object;
    const order = await Order.findOne({ stripePaymentIntentId: intent.id });
    if (order && order.paymentStatus !== "paid") {
      order.paymentStatus = "paid";
      order.status = "placed";
      order.statusHistory.push({ status: "placed" });
      await order.save();
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object;
    await Order.findOneAndUpdate(
      { stripePaymentIntentId: intent.id },
      { status: "cancelled" }
    );
  }

  res.json({ received: true });
};
