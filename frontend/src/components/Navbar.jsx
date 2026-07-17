import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Menu, X, UtensilsCrossed, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, profile, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const dashboardPath =
    profile?.role === "admin"
      ? "/admin"
      : profile?.role === "owner"
      ? "/owner"
      : "/dashboard";

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-gray-900 dark:text-white">
          <UtensilsCrossed className="text-primary-500" />
          Food<span className="text-primary-500">Hub</span> AI
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/restaurants" className="text-sm font-medium hover:text-primary-500 transition">
            Restaurants
          </Link>
          {isAuthenticated && (
            <Link to={dashboardPath} className="text-sm font-medium hover:text-primary-500 transition flex items-center gap-1">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          <Link to="/cart" className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <button
              onClick={async () => {
                await logout();
                navigate("/");
              }}
              className="btn-outline text-sm py-1.5 px-4 flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          ) : (
            <Link to="/login" className="btn-primary text-sm py-1.5 px-4">
              Sign In
            </Link>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-gray-100 dark:border-gray-800"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              <Link to="/restaurants" onClick={() => setOpen(false)}>Restaurants</Link>
              <Link to="/cart" onClick={() => setOpen(false)}>Cart ({itemCount})</Link>
              {isAuthenticated ? (
                <>
                  <Link to={dashboardPath} onClick={() => setOpen(false)}>Dashboard</Link>
                  <button
                    className="text-left text-red-500"
                    onClick={async () => {
                      await logout();
                      setOpen(false);
                      navigate("/");
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setOpen(false)}>Sign In</Link>
              )}
              <ThemeToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
