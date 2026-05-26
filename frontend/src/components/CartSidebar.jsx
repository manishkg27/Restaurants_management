import React from "react";
import { useCart } from "../context/CartContext";
import CartItem from "./CartItem";
import { X, ShoppingBag, Trash2 } from "lucide-react";
import formatCurrency from "../utils/formatCurrency";
import { useNavigate } from "react-router-dom";
import "./CartSidebar.css";

const CartSidebar = ({ isOpen, onClose }) => {
  const { cartItems, cartTotal, restaurantName, clearCart } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckoutClick = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <div
      className="cart-sidebar__backdrop"
      onClick={onClose}
    >
      {/* Sidebar Panel */}
      <div
        className="cart-sidebar__panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="cart-sidebar__header">
          <div className="cart-sidebar__title-wrapper">
            <ShoppingBag size={18} className="cart-sidebar__title-icon" />
            <h3 className="cart-sidebar__title">My Cart</h3>
          </div>
          <button
            onClick={onClose}
            className="cart-sidebar__close-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Restaurant Name */}
        {restaurantName && (
          <div className="cart-sidebar__restaurant-banner">
            Ordering from: {restaurantName}
          </div>
        )}

        {/* Scrollable list */}
        <div className="cart-sidebar__content">
          {cartItems.length === 0 ? (
            <div className="cart-sidebar__empty">
              <ShoppingBag size={36} strokeWidth={1.5} />
              <p className="cart-sidebar__empty-text">Your cart is empty</p>
            </div>
          ) : (
            cartItems.map((item) => <CartItem key={item._id} item={item} />)
          )}
        </div>

        {/* Footer info */}
        {cartItems.length > 0 && (
          <div className="cart-sidebar__footer">
            <div className="cart-sidebar__total">
              <span className="cart-sidebar__total-label">Total Amount:</span>
              <span className="cart-sidebar__total-amount">
                {formatCurrency(cartTotal)}
              </span>
            </div>

            <div className="cart-sidebar__actions">
              <button
                onClick={clearCart}
                className="cart-sidebar__clear-btn"
                title="Clear Cart"
              >
                <Trash2 size={15} />
              </button>
              <button
                onClick={handleCheckoutClick}
                className="cart-sidebar__checkout-btn"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
