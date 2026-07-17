import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import StripeCheckoutForm from "../components/StripeCheckoutForm";
import LoadingSpinner from "../components/LoadingSpinner";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Checkout = () => {
  const { items, restaurantId, subtotal, clearCart } = useCart();
  const { profile, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({ line1: "", city: "", state: "", zip: "" });
  const [order, setOrder] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please sign in to checkout");
      navigate("/login");
    }
    if (items.length === 0) navigate("/cart");
  }, [isAuthenticated, items, navigate]);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: createdOrder } = await api.post("/orders", {
        restaurantId,
        items: items.map((i) => ({ menuItem: i.menuItem, quantity: i.quantity })),
        deliveryAddress: address,
      });
      const { data } = await api.post("/payments/create-intent", { orderId: createdOrder._id });
      setOrder(createdOrder);
      setClientSecret(data.clientSecret);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const tax = subtotal * 0.08;
  const deliveryFee = 2.99;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold mb-6">Checkout</h1>

      {!clientSecret ? (
        <form onSubmit={handleCreateOrder} className="space-y-6">
          <div className="card p-5 space-y-3">
            <h2 className="font-bold">Delivery Address</h2>
            <input
              required
              placeholder="Street address"
              className="input"
              value={address.line1}
              onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))}
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                required
                placeholder="City"
                className="input"
                value={address.city}
                onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
              />
              <input
                required
                placeholder="State"
                className="input"
                value={address.state}
                onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
              />
              <input
                required
                placeholder="ZIP"
                className="input"
                value={address.zip}
                onChange={(e) => setAddress((a) => ({ ...a, zip: e.target.value }))}
              />
            </div>
          </div>

          <div className="card p-5 space-y-2">
            <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Delivery fee</span><span>${deliveryFee.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-lg border-t border-gray-100 dark:border-gray-800 pt-2">
              <span>Total</span><span>${(subtotal + deliveryFee + tax).toFixed(2)}</span>
            </div>
          </div>

          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Preparing payment..." : "Continue to Payment"}
          </button>
        </form>
      ) : (
        <div className="card p-6">
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripeCheckoutForm orderId={order._id} />
          </Elements>
        </div>
      )}
    </div>
  );
};

export default Checkout;
