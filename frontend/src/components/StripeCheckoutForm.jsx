import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";

const StripeCheckoutForm = ({ orderId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const { clearCart } = useCart();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      toast.error(error.message);
      setSubmitting(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      toast.success("Payment successful! Order placed.");
      clearCart();
      navigate(`/orders/${orderId}`);
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement />
      <button className="btn-primary w-full" disabled={!stripe || submitting}>
        {submitting ? "Processing..." : "Pay & Place Order"}
      </button>
      <p className="text-xs text-gray-400 text-center">
        Test mode — use card <strong>4242 4242 4242 4242</strong>, any future date & CVC.
      </p>
    </form>
  );
};

export default StripeCheckoutForm;
