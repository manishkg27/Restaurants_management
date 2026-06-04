import React from "react";
import { useCart } from "../../context/CartContext";
import CartItem from "./CartItem";
import { X, ShoppingBag, Trash2 } from "lucide-react";
import formatCurrency from "../../lib/formatCurrency";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "./CartSidebar.css";

const CartSidebar = ({ isOpen, onClose }) => {
  const { cartItems, cartTotal, restaurantName, restaurantDetails, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  let isClosed = false;
  if (restaurantDetails?.openTime && restaurantDetails?.closeTime) {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;

      const [openH, openM] = restaurantDetails.openTime.split(':').map(Number);
      const [closeH, closeM] = restaurantDetails.closeTime.split(':').map(Number);
      const openTime = openH * 60 + openM;
      let closeTime = closeH * 60 + closeM;

      if (closeTime < openTime) {
        if (currentTime < openTime && currentTime > closeTime) {
          isClosed = true;
        }
      } else {
        if (currentTime < openTime || currentTime > closeTime) {
          isClosed = true;
        }
      }
    } catch (e) {
      console.error("Error parsing operating hours", e);
    }
  }

  const handleCheckoutClick = () => {
    if (isClosed) return;
    // Enforce profile completion
    const p = user?.profile;
    const firstAddress = p?.addresses?.[0];
    if (
      !p ||
      !p.fullName ||
      !p.contactNumber ||
      !firstAddress ||
      !firstAddress.address ||
      !firstAddress.city ||
      !firstAddress.state ||
      !firstAddress.pinCode
    ) {
      toast.warning("Please complete your profile delivery details (including a saved address with city, state, and zip code) to proceed to checkout.", { autoClose: 5000 });
      onClose();
      navigate("/profile");
      return;
    }

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

        {/* Closed warning banner */}
        {isClosed && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', fontSize: '13px', fontWeight: 'bold', textAlign: 'center', borderBottom: '1px solid #fecaca' }}>
            This restaurant is currently closed. You cannot checkout at this time.
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
                disabled={isClosed}
                className={`cart-sidebar__checkout-btn ${isClosed ? 'cart-sidebar__checkout-btn--disabled' : ''}`}
                style={isClosed ? { opacity: 0.5, cursor: 'not-allowed', backgroundColor: '#9ca3af' } : {}}
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
