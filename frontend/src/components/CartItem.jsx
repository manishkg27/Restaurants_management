import React from "react";
import { useCart } from "../context/CartContext";
import { Plus, Minus, Trash2 } from "lucide-react";
import formatCurrency from "../utils/formatCurrency";
import "./CartItem.css";

const CartItem = ({ item }) => {
  const { updateQty, removeItem } = useCart();

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQty(item._id, item.quantity - 1);
    } else {
      removeItem(item._id);
    }
  };

  const handleIncrease = () => {
    updateQty(item._id, item.quantity + 1);
  };

  const imageUrl = item.itemInfo.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80";

  return (
    <div className="cart-item">
      <img
        src={imageUrl}
        alt={item.itemInfo.name}
        className="cart-item__image"
      />

      <div className="cart-item__details">
        <h5 className="cart-item__name">
          {item.itemInfo.name}
        </h5>
        <div className="cart-item__price-wrap">
          <span className="cart-item__price">
            {formatCurrency(item.itemInfo.price)}
          </span>
          <span className="cart-item__qty-text">
            x {item.quantity}
          </span>
        </div>
      </div>

      <div className="cart-item__actions">
        {/* Quantity Controls */}
        <div className="cart-item__qty-controls">
          <button
            onClick={handleDecrease}
            className="cart-item__qty-btn"
          >
            <Minus size={10} />
          </button>
          <span className="cart-item__qty-value">
            {item.quantity}
          </span>
          <button
            onClick={handleIncrease}
            className="cart-item__qty-btn"
          >
            <Plus size={10} />
          </button>
        </div>

        {/* Delete button */}
        <button
          onClick={() => removeItem(item._id)}
          className="cart-item__remove-btn"
          title="Remove Item"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
