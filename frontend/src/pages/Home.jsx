import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import RestaurantCard from "../components/RestaurantCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const [restRes, trendRes] = await Promise.all([
          api.get("/restaurants?limit=8"),
          api.get("/recommendations/trending"),
        ]);
        setFeatured(restRes.data.restaurants);
        setTrending(trendRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/restaurants?search=${encodeURIComponent(query)}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Sparkles size={16} /> AI-powered recommendations
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight max-w-2xl">
              Delicious food, delivered smart.
            </h1>
            <p className="mt-4 text-lg text-white/90 max-w-xl">
              Discover restaurants tailored to your taste, track your order live, and enjoy a
              seamless checkout — all in one place.
            </p>

            <form onSubmit={handleSearch} className="mt-8 max-w-lg flex bg-white rounded-full p-1.5 shadow-lg">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search restaurants or cuisines..."
                className="flex-1 px-4 py-2 rounded-full text-gray-900 focus:outline-none"
              />
              <button className="bg-primary-500 hover:bg-primary-600 text-white p-3 rounded-full transition">
                <Search size={18} />
              </button>
            </form>
          </motion.div>
        </div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -top-16 -left-16 w-72 h-72 bg-accent-400/30 rounded-full blur-3xl" />
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {isAuthenticated && trending.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Sparkles className="text-primary-500" /> Trending Right Now
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {trending.slice(0, 4).map((item) => (
                    <div key={item._id} className="card p-3 animate-fadeUp">
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
                        alt={item.name}
                        className="rounded-xl h-28 w-full object-cover mb-2"
                      />
                      <p className="font-semibold text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.restaurant?.name}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Featured Restaurants</h2>
                <Link to="/restaurants" className="text-primary-500 font-semibold text-sm">
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featured.map((r) => (
                  <RestaurantCard key={r._id} restaurant={r} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
