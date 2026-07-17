import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [restaurantId, setRestaurantId] = useState(
    () => localStorage.getItem("foodhub-cart-restaurant") || null
  );
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("foodhub-cart-items");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("foodhub-cart-items", JSON.stringify(items));
    if (restaurantId) localStorage.setItem("foodhub-cart-restaurant", restaurantId);
  }, [items, restaurantId]);

  const addItem = (menuItem, restaurant) => {
    if (restaurantId && restaurantId !== restaurant._id && items.length > 0) {
      const confirmSwitch = window.confirm(
        "Your cart has items from another restaurant. Start a new cart?"
      );
      if (!confirmSwitch) return;
      setItems([]);
    }
    setRestaurantId(restaurant._id);
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItem === menuItem._id);
      if (existing) {
        return prev.map((i) =>
          i.menuItem === menuItem._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        { menuItem: menuItem._id, name: menuItem.name, price: menuItem.price, quantity: 1 },
      ];
    });
    toast.success(`${menuItem.name} added to cart`);
  };

  const updateQuantity = (menuItemId, quantity) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.menuItem !== menuItemId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.menuItem === menuItemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
    localStorage.removeItem("foodhub-cart-restaurant");
  };

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, restaurantId, addItem, updateQuantity, clearCart, subtotal, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
