import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Clock, MapPin, DollarSign } from "lucide-react";
import api from "../utils/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import MenuItemCard from "../components/MenuItemCard";
import StarRating from "../components/StarRating";
import LoadingSpinner from "../components/LoadingSpinner";

const RestaurantDetail = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const load = async () => {
    setLoading(true);
    try {
      const [{ data }, { data: reviewData }] = await Promise.all([
        api.get(`/restaurants/${id}`),
        api.get(`/reviews/${id}`),
      ]);
      setRestaurant(data.restaurant);
      setMenu(data.menu);
      setReviews(reviewData);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error("Please sign in to leave a review");
    try {
      await api.post(`/reviews/${id}`, reviewForm);
      toast.success("Review submitted!");
      setReviewForm({ rating: 5, comment: "" });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!restaurant) return <p className="text-center py-20">Restaurant not found.</p>;

  const categories = ["All", ...new Set(menu.map((m) => m.category))];
  const filteredMenu = activeCategory === "All" ? menu : menu.filter((m) => m.category === activeCategory);

  return (
    <div>
      <div className="h-64 relative">
        <img src={restaurant.coverImage} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-6 left-4 sm:left-8 text-white">
          <h1 className="text-3xl sm:text-4xl font-extrabold">{restaurant.name}</h1>
          <p className="text-white/90 mt-1">{restaurant.cuisines?.join(", ")}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-300 mb-8 card p-4">
          <span className="flex items-center gap-1"><StarRating rating={restaurant.avgRating} size={14} /> ({restaurant.numReviews})</span>
          <span className="flex items-center gap-1"><Clock size={16} /> {restaurant.estimatedDeliveryTime} min</span>
          <span className="flex items-center gap-1"><DollarSign size={16} /> Delivery ${restaurant.deliveryFee?.toFixed(2)}</span>
          <span className="flex items-center gap-1"><MapPin size={16} /> {restaurant.address?.city}, {restaurant.address?.state}</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                activeCategory === c
                  ? "bg-primary-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          {filteredMenu.map((item) => (
            <MenuItemCard key={item._id} item={item} onAdd={(i) => addItem(i, restaurant)} />
          ))}
        </div>

        <section className="max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">Reviews</h2>
          <form onSubmit={submitReview} className="card p-5 mb-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Your rating:</span>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setReviewForm((f) => ({ ...f, rating: n }))}
                >
                  <StarRating rating={n <= reviewForm.rating ? 5 : 0} size={18} />
                </button>
              ))}
            </div>
            <textarea
              className="input"
              rows={3}
              placeholder="Share your experience..."
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
            />
            <button className="btn-primary">Submit Review</button>
          </form>

          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="card p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">{r.customer?.name}</span>
                  <StarRating rating={r.rating} size={14} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{r.comment}</p>
                {r.ownerReply && (
                  <div className="mt-2 pl-3 border-l-2 border-primary-400 text-sm text-gray-500">
                    <strong>Owner reply:</strong> {r.ownerReply}
                  </div>
                )}
              </div>
            ))}
            {reviews.length === 0 && <p className="text-gray-500 text-sm">No reviews yet — be the first!</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default RestaurantDetail;
