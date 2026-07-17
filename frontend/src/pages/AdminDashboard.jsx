import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { Users, Store, ShoppingBag, DollarSign, Ban, CheckCircle } from "lucide-react";
import api from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";

const TABS = ["Analytics", "Restaurant Approvals", "Users"];

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-xl text-primary-500">
      <Icon size={22} />
    </div>
    <div>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [tab, setTab] = useState(TABS[0]);
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [{ data: s }, { data: p }, { data: u }] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/restaurants/pending"),
        api.get("/admin/users"),
      ]);
      setStats(s);
      setPending(p);
      setUsers(u);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const approve = async (id) => {
    await api.patch(`/admin/restaurants/${id}/approve`);
    setPending((prev) => prev.filter((r) => r._id !== id));
    toast.success("Restaurant approved");
  };

  const toggleBan = async (id) => {
    const { data } = await api.patch(`/admin/users/${id}/ban`);
    setUsers((prev) => prev.map((u) => (u._id === id ? data : u)));
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold mb-6">Admin Dashboard</h1>

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

      {tab === "Analytics" && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Total Users" value={stats.userCount} />
            <StatCard icon={Store} label="Restaurants" value={stats.restaurantCount} />
            <StatCard icon={ShoppingBag} label="Paid Orders" value={stats.orderCount} />
            <StatCard icon={DollarSign} label="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} />
          </div>

          <div className="card p-6">
            <h2 className="font-bold mb-4">Revenue Over Time</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stats.ordersByDay}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6">
            <h2 className="font-bold mb-4">Top Restaurants by Revenue</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.topRestaurants.map((t) => ({ name: t.restaurant.name, revenue: t.revenue }))}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === "Restaurant Approvals" && (
        <div className="space-y-3">
          {pending.map((r) => (
            <div key={r._id} className="card p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{r.name}</p>
                <p className="text-xs text-gray-500">Owner: {r.owner?.name} ({r.owner?.email})</p>
              </div>
              <button onClick={() => approve(r._id)} className="btn-primary text-sm flex items-center gap-2">
                <CheckCircle size={16} /> Approve
              </button>
            </div>
          ))}
          {pending.length === 0 && <p className="text-gray-500 text-sm">No pending restaurants 🎉</p>}
        </div>
      )}

      {tab === "Users" && (
        <div className="card divide-y divide-gray-100 dark:divide-gray-800">
          {users.map((u) => (
            <div key={u._id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{u.name} <span className="text-xs text-gray-400">({u.role})</span></p>
                <p className="text-xs text-gray-500">{u.email}</p>
              </div>
              <button
                onClick={() => toggleBan(u._id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 ${
                  u.isBanned ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                }`}
              >
                <Ban size={14} /> {u.isBanned ? "Unban" : "Ban"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
