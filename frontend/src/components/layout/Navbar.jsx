import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { ShoppingCart, LogOut, User as UserIcon, ChefHat, ClipboardList, LayoutDashboard, Search } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import "./Navbar.css";

const Navbar = ({ onCartClick }) => {
  const { user, logout, isOwner } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [navSearch, setNavSearch] = useState("");

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
      navigate("/login");
    }
  };

  const handleNavSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/search?query=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch("");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar__container">
        {/* Brand Logo & Search */}
        <div className="navbar__brand-wrapper">
          <Link to="/" className="navbar__brand">
            <ChefHat size={24} />
            <span>Eatify</span>
          </Link>

          {/* Search Restaurant Input */}
          <form onSubmit={handleNavSearchSubmit} className="navbar__search">
            <Search size={13} className="navbar__search-icon" />
            <input
              type="text"
              placeholder="Search dishes or restaurants..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="navbar__search-input"
            />
          </form>
        </div>

        {/* Navigation Items */}
        <div className="navbar__nav">
          <Link to="/restaurants" className="navbar__nav-item">
            Restaurants
          </Link>

          {!user ? (
            <div className="navbar__actions">
              <Link to="/login" className="navbar__btn navbar__btn--secondary">
                Login
              </Link>
              <Link to="/register" className="navbar__btn navbar__btn--primary">
                Register
              </Link>
            </div>
          ) : isOwner() ? (
            <div className="navbar__actions">
              <Link to="/owner/dashboard" className="navbar__nav-item">
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
              <Link to="/owner/restaurant" className="navbar__nav-item">
                Setup
              </Link>
              <Link to="/owner/menu" className="navbar__nav-item">
                Menu
              </Link>
              <Link to="/owner/orders" className="navbar__nav-item">
                <ClipboardList size={15} />
                Orders
              </Link>
              <Link to="/owner/manager" className="navbar__nav-item">
                Manager
              </Link>
              <Link to="/profile" className="navbar__nav-item">
                <UserIcon size={16} />
              </Link>
              
              <NotificationDropdown />

              <button
                onClick={handleLogout}
                className="navbar__icon-btn"
                title="Logout"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="navbar__actions">
              <Link to="/orders" className="navbar__nav-item">
                Orders
              </Link>
              <Link to="/profile" className="navbar__nav-item">
                <UserIcon size={16} />
              </Link>

              <NotificationDropdown />

              {/* Cart Button */}
              <button
                onClick={onCartClick}
                className="navbar__cart-btn"
                title="View Cart"
              >
                <ShoppingCart size={16} />
                {cartCount > 0 && (
                  <span className="navbar__cart-badge">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={handleLogout}
                className="navbar__icon-btn"
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
