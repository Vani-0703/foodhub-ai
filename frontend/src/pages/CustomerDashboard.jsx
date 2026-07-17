import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Store } from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const statusColor = {
  pending_payment: "bg-gray-100 text-gray-600",
  placed: "bg-blue-100 text-blue-600",
  accepted: "bg-indigo-100 text-indigo-600",
  preparing: "bg-yellow-100 text-yellow-700",
  out_for_delivery: "bg-orange-100 text-orange-600",
  delivered: "bg-green-100 text-green-600",
  cancelled: "bg-red-100 text-red-600",
};

const CustomerDashboard = () => {
  const { profile, becomeOwner } = useAuth();
  const [orders, setOrders] = useState([]);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: orderData }, { data: recData }] = await Promise.all([
          api.get("/orders/mine"),
          api.get("/recommendations"),
        ]);
        setOrders(orderData);
        setRecs(recData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Hi, {profile?.name} 👋</h1>
          <p className="text-gray-500">Here's what's happening with your orders.</p>
        </div>
        {profile?.role === "customer" && (
          <button onClick={becomeOwner} className="btn-outline text-sm flex items-center gap-2">
            <Store size={16} /> Become a Restaurant Owner
          </button>
        )}
      </div>

      {recs.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="text-primary-500" /> Picked for you by AI
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {recs.map((item) => (
              <Link key={item._id} to={`/restaurants/${item.restaurant?._id}`} className="card p-3">
                <img
                  src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
                  className="rounded-xl h-20 w-full object-cover mb-2"
                  alt={item.name}
                />
                <p className="text-xs font-semibold truncate">{item.name}</p>
                <p className="text-[10px] text-gray-500 truncate">{item.restaurant?.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold mb-4">Order History</h2>
        {orders.length === 0 ? (
          <p className="text-gray-500">No orders yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <Link
                key={o._id}
                to={`/orders/${o._id}`}
                className="card p-4 flex items-center justify-between hover:shadow-lg transition"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={o.restaurant?.coverImage}
                    className="w-14 h-14 rounded-xl object-cover"
                    alt={o.restaurant?.name}
                  />
                  <div>
                    <p className="font-semibold">{o.restaurant?.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(o.createdAt).toLocaleDateString()} · ${o.total.toFixed(2)}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor[o.status]}`}>
                  {o.status.replace(/_/g, " ")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CustomerDashboard;
