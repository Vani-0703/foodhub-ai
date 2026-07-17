import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { CheckCircle, Circle } from "lucide-react";
import api from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";

const STEPS = ["placed", "accepted", "preparing", "out_for_delivery", "delivered"];
const LABELS = {
  placed: "Order Placed",
  accepted: "Accepted by Restaurant",
  preparing: "Preparing your food",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
      setLoading(false);
    };
    load();

    const socket = io(import.meta.env.VITE_API_URL.replace("/api", ""));
    socket.emit("join_order_room", id);
    socket.on("order_status_updated", (payload) => {
      if (payload.orderId === id) {
        setOrder((prev) => (prev ? { ...prev, status: payload.status } : prev));
      }
    });

    return () => socket.disconnect();
  }, [id]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!order) return <p className="text-center py-20">Order not found.</p>;

  const currentStepIndex = STEPS.indexOf(order.status);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold mb-2">Order Tracking</h1>
      <p className="text-gray-500 mb-8">Order #{order._id.slice(-6).toUpperCase()} · {order.restaurant?.name}</p>

      {order.status === "cancelled" ? (
        <div className="card p-6 text-center text-red-500 font-semibold">This order was cancelled.</div>
      ) : (
        <div className="card p-6 space-y-6">
          {STEPS.map((step, idx) => (
            <div key={step} className="flex items-center gap-3">
              {idx <= currentStepIndex ? (
                <CheckCircle className="text-primary-500" size={22} />
              ) : (
                <Circle className="text-gray-300" size={22} />
              )}
              <span className={idx <= currentStepIndex ? "font-semibold" : "text-gray-400"}>
                {LABELS[step]}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="card p-6 mt-6">
        <h2 className="font-bold mb-3">Order Summary</h2>
        {order.items.map((i) => (
          <div key={i.name} className="flex justify-between text-sm py-1">
            <span>{i.quantity} × {i.name}</span>
            <span>${(i.price * i.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold border-t border-gray-100 dark:border-gray-800 mt-3 pt-3">
          <span>Total</span>
          <span>${order.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
