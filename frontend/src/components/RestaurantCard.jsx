import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Star } from "lucide-react";

const RestaurantCard = ({ restaurant }) => (
  <motion.div
    whileHover={{ y: -6 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <Link to={`/restaurants/${restaurant._id}`} className="card block overflow-hidden group">
      <div className="relative h-40 overflow-hidden">
        <img
          src={restaurant.coverImage || "https://images.unsplash.com/photo-1504674900247-0877df9cc836"}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {restaurant.isFeatured && (
          <span className="absolute top-3 left-3 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            Featured
          </span>
        )}
        <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-gray-900/90 rounded-full px-2 py-1 flex items-center gap-1 text-xs font-semibold">
          <Star size={12} className="fill-yellow-400 text-yellow-400" />
          {restaurant.avgRating?.toFixed(1) || "New"}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white truncate">{restaurant.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {restaurant.cuisines?.join(", ")}
        </p>
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Clock size={14} /> {restaurant.estimatedDeliveryTime} min
          </span>
          <span>{"$".repeat(restaurant.priceRange || 1)}</span>
        </div>
      </div>
    </Link>
  </motion.div>
);

export default RestaurantCard;
