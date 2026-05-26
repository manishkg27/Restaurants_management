import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ShoppingCart, LogOut, User as UserIcon, ChefHat, ClipboardList, LayoutDashboard, Search } from "lucide-react";

const Navbar = ({ onCartClick }) => {
  const { user, logout, isOwner } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [navSearch, setNavSearch] = useState("");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleNavSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/search?query=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch("");
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo & Search */}
        <div className="flex items-center gap-6 flex-grow max-w-md md:max-w-lg">
          <Link to="/" className="flex items-center gap-2 text-orange-600 font-bold text-xl no-underline flex-shrink-0">
            <ChefHat size={24} />
            <span>Eatify</span>
          </Link>

          {/* Search Restaurant Input */}
          <form onSubmit={handleNavSearchSubmit} className="hidden sm:flex items-center border border-gray-300 rounded bg-gray-50 px-3 py-1.5 flex-grow">
            <Search size={13} className="text-gray-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search dishes or restaurants..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-gray-700 w-full"
            />
          </form>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center gap-5 text-sm flex-shrink-0">
          <Link to="/restaurants" className="text-gray-700 hover:text-orange-600 font-semibold no-underline">
            Restaurants
          </Link>

          {!user ? (
            <div className="flex items-center gap-3">
              <Link to="/login" className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-3 py-1.5 rounded border border-gray-300 no-underline">
                Login
              </Link>
              <Link to="/register" className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-3 py-1.5 rounded no-underline">
                Register
              </Link>
            </div>
          ) : isOwner() ? (
            <div className="flex items-center gap-4">
              <Link to="/owner/dashboard" className="flex items-center gap-1 text-gray-700 hover:text-orange-600 font-semibold no-underline">
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
              <Link to="/owner/restaurant" className="text-gray-700 hover:text-orange-600 font-semibold no-underline">
                Setup
              </Link>
              <Link to="/owner/menu" className="text-gray-700 hover:text-orange-600 font-semibold no-underline">
                Menu
              </Link>
              <Link to="/owner/orders" className="flex items-center gap-1 text-gray-700 hover:text-orange-600 font-semibold no-underline">
                <ClipboardList size={15} />
                Orders
              </Link>
              <Link to="/owner/manager" className="text-gray-700 hover:text-orange-600 font-semibold no-underline">
                Manager
              </Link>
              <Link to="/profile" className="text-gray-700 hover:text-orange-600 font-semibold no-underline">
                <UserIcon size={16} />
              </Link>
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 p-1.5 rounded cursor-pointer flex items-center justify-center"
                title="Logout"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/orders" className="text-gray-700 hover:text-orange-600 font-semibold no-underline">
                Orders
              </Link>
              <Link to="/profile" className="text-gray-700 hover:text-orange-600 font-semibold no-underline">
                <UserIcon size={16} />
              </Link>

              {/* Cart Button */}
              <button
                onClick={onCartClick}
                className="relative bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
                title="View Cart"
              >
                <ShoppingCart size={16} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xxs font-bold w-4 h-4 rounded-full flex items-center justify-center text-xs">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 p-1.5 rounded cursor-pointer flex items-center justify-center"
                title="Logout"
              >
                <LogOut size={15} />
              </button>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
