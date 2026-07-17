import { motion } from "framer-motion";
import { Plus, Leaf } from "lucide-react";

const MenuItemCard = ({ item, onAdd }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="card flex gap-4 p-4 items-center"
  >
    <img
      src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
      alt={item.name}
      className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
    />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        {item.isVeg && <Leaf size={14} className="text-green-500" />}
        <h4 className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</h4>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{item.description}</p>
      <p className="font-bold text-primary-600 dark:text-primary-400 mt-1">${item.price.toFixed(2)}</p>
    </div>
    <button
      onClick={() => onAdd(item)}
      className="p-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-full flex-shrink-0 transition active:scale-90"
      aria-label={`Add ${item.name} to cart`}
    >
      <Plus size={18} />
    </button>
  </motion.div>
);

export default MenuItemCard;
