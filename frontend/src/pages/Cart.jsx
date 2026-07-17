import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const { items, updateQuantity, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="mx-auto text-gray-300" size={64} />
        <h2 className="text-2xl font-bold mt-4">Your cart is empty</h2>
        <p className="text-gray-500 mt-2">Browse restaurants and add something delicious.</p>
        <Link to="/restaurants" className="btn-primary inline-block mt-6">
          Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold mb-6">Your Cart</h1>
      <div className="card divide-y divide-gray-100 dark:divide-gray-800">
        {items.map((item) => (
          <div key={item.menuItem} className="flex items-center justify-between p-4">
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateQuantity(item.menuItem, item.quantity - 1)}
                className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200"
              >
                <Minus size={14} />
              </button>
              <span className="w-6 text-center font-semibold">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.menuItem, item.quantity + 1)}
                className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200"
              >
                <Plus size={14} />
              </button>
              <button
                onClick={() => updateQuantity(item.menuItem, 0)}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-full ml-2"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-5 mt-6 space-y-2">
        <div className="flex justify-between text-gray-600 dark:text-gray-300">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <p className="text-xs text-gray-400">Delivery fee & tax calculated at checkout.</p>
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={clearCart} className="btn-outline flex-1">
          Clear Cart
        </button>
        <button onClick={() => navigate("/checkout")} className="btn-primary flex-1">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
