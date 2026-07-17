import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Edit2 } from "lucide-react";
import api from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";

const TABS = ["My Restaurants", "Menu", "Orders"];

const emptyRestaurant = {
  name: "",
  description: "",
  cuisines: "",
  coverImage: "",
  deliveryFee: 2.99,
  estimatedDeliveryTime: 30,
  address: { line1: "", city: "", state: "", zip: "" },
};

const emptyItem = { name: "", description: "", price: "", category: "Main", cuisine: "", image: "" };

const OwnerDashboard = () => {
  const [tab, setTab] = useState(TABS[0]);
  const [restaurants, setRestaurants] = useState([]);
  const [selected, setSelected] = useState(null);
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(emptyRestaurant);
  const [itemForm, setItemForm] = useState(emptyItem);
  const [loading, setLoading] = useState(true);

  const loadRestaurants = async () => {
    const { data } = await api.get("/restaurants/owner/mine");
    setRestaurants(data);
    if (data.length && !selected) setSelected(data[0]);
    setLoading(false);
  };

  useEffect(() => {
    loadRestaurants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selected) return;
    api.get(`/menu/${selected._id}`).then((r) => setMenu(r.data));
    api.get(`/orders/restaurant/${selected._id}`).then((r) => setOrders(r.data));
  }, [selected]);

  const createRestaurant = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, cuisines: form.cuisines.split(",").map((c) => c.trim()).filter(Boolean) };
      const { data } = await api.post("/restaurants", payload);
      toast.success("Restaurant created — pending admin approval");
      setForm(emptyRestaurant);
      setRestaurants((prev) => [...prev, data]);
      setSelected(data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const addMenuItem = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(`/menu/${selected._id}`, {
        ...itemForm,
        price: Number(itemForm.price),
      });
      setMenu((prev) => [...prev, data]);
      setItemForm(emptyItem);
      toast.success("Menu item added");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const deleteMenuItem = async (itemId) => {
    await api.delete(`/menu/item/${itemId}`);
    setMenu((prev) => prev.filter((m) => m._id !== itemId));
  };

  const toggleAvailability = async (item) => {
    const { data } = await api.patch(`/menu/item/${item._id}`, { isAvailable: !item.isAvailable });
    setMenu((prev) => prev.map((m) => (m._id === item._id ? data : m)));
  };

  const updateOrderStatus = async (orderId, status) => {
    const { data } = await api.patch(`/orders/${orderId}/status`, { status });
    setOrders((prev) => prev.map((o) => (o._id === orderId ? data : o)));
    toast.success(`Order marked as ${status.replace(/_/g, " ")}`);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold mb-6">Restaurant Owner Dashboard</h1>

      <div className="flex gap-2 mb-8 border-b border-gray-200 dark:border-gray-800">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 font-semibold text-sm border-b-2 transition ${
              tab === t ? "border-primary-500 text-primary-500" : "border-transparent text-gray-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "My Restaurants" && (
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="font-bold mb-3">Your Restaurants</h2>
            <div className="space-y-2">
              {restaurants.map((r) => (
                <button
                  key={r._id}
                  onClick={() => setSelected(r)}
                  className={`card w-full text-left p-4 flex items-center justify-between ${
                    selected?._id === r._id ? "ring-2 ring-primary-400" : ""
                  }`}
                >
                  <span className="font-semibold">{r.name}</span>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      r.isApproved ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {r.isApproved ? "Live" : "Pending approval"}
                  </span>
                </button>
              ))}
              {restaurants.length === 0 && <p className="text-gray-500 text-sm">No restaurants yet.</p>}
            </div>
          </div>

          <form onSubmit={createRestaurant} className="card p-5 space-y-3">
            <h2 className="font-bold">Add a New Restaurant</h2>
            <input required placeholder="Name" className="input" value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <textarea placeholder="Description" className="input" value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            <input placeholder="Cuisines (comma separated)" className="input" value={form.cuisines}
              onChange={(e) => setForm((f) => ({ ...f, cuisines: e.target.value }))} />
            <input placeholder="Cover image URL" className="input" value={form.coverImage}
              onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="City" className="input" value={form.address.city}
                onChange={(e) => setForm((f) => ({ ...f, address: { ...f.address, city: e.target.value } }))} />
              <input placeholder="State" className="input" value={form.address.state}
                onChange={(e) => setForm((f) => ({ ...f, address: { ...f.address, state: e.target.value } }))} />
            </div>
            <button className="btn-primary w-full flex items-center justify-center gap-2">
              <Plus size={16} /> Create Restaurant
            </button>
            <p className="text-xs text-gray-400">
              Tip: use the Upload API (Cloudinary) from your own UI to get a coverImage URL, or paste any image link for now.
            </p>
          </form>
        </div>
      )}

      {tab === "Menu" && selected && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h2 className="font-bold">{selected.name} — Menu</h2>
            {menu.map((item) => (
              <div key={item._id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-gray-500">${item.price.toFixed(2)} · {item.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAvailability(item)}
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      item.isAvailable ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {item.isAvailable ? "Available" : "86'd"}
                  </button>
                  <button onClick={() => deleteMenuItem(item._id)} className="text-red-500 p-1.5">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {menu.length === 0 && <p className="text-gray-500 text-sm">No menu items yet.</p>}
          </div>

          <form onSubmit={addMenuItem} className="card p-5 space-y-3">
            <h2 className="font-bold">Add Menu Item</h2>
            <input required placeholder="Name" className="input" value={itemForm.name}
              onChange={(e) => setItemForm((f) => ({ ...f, name: e.target.value }))} />
            <textarea placeholder="Description" className="input" value={itemForm.description}
              onChange={(e) => setItemForm((f) => ({ ...f, description: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <input required type="number" step="0.01" placeholder="Price" className="input" value={itemForm.price}
                onChange={(e) => setItemForm((f) => ({ ...f, price: e.target.value }))} />
              <select className="input" value={itemForm.category}
                onChange={(e) => setItemForm((f) => ({ ...f, category: e.target.value }))}>
                <option>Starter</option>
                <option>Main</option>
                <option>Dessert</option>
                <option>Drink</option>
              </select>
            </div>
            <input placeholder="Cuisine (e.g. Italian)" className="input" value={itemForm.cuisine}
              onChange={(e) => setItemForm((f) => ({ ...f, cuisine: e.target.value }))} />
            <input placeholder="Image URL" className="input" value={itemForm.image}
              onChange={(e) => setItemForm((f) => ({ ...f, image: e.target.value }))} />
            <button className="btn-primary w-full flex items-center justify-center gap-2">
              <Plus size={16} /> Add Item
            </button>
          </form>
        </div>
      )}

      {tab === "Orders" && selected && (
        <div className="space-y-3">
          <h2 className="font-bold mb-3">{selected.name} — Incoming Orders</h2>
          {orders.map((o) => (
            <div key={o._id} className="card p-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-semibold">#{o._id.slice(-6).toUpperCase()} · {o.customer?.name}</p>
                <p className="text-xs text-gray-500">
                  {o.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")} · ${o.total.toFixed(2)}
                </p>
              </div>
              <select
                value={o.status}
                onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                className="input w-auto text-sm"
                disabled={["pending_payment", "cancelled", "delivered"].includes(o.status)}
              >
                {["placed", "accepted", "preparing", "out_for_delivery", "delivered"].map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
          ))}
          {orders.length === 0 && <p className="text-gray-500 text-sm">No orders yet.</p>}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
