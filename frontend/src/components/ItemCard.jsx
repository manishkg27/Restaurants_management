import React from "react";
import { useCart } from "../context/CartContext";
import { Star, Plus, Check } from "lucide-react";
import formatCurrency from "../utils/formatCurrency";
import "./ItemCard.css";

const ItemCard = ({ item }) => {
  const { addToCart, cartItems, removeItem } = useCart();

  const inCart = cartItems.find((ci) => ci.itemInfo._id === item._id);

  const handleAdd = async () => {
    await addToCart(item._id);
  };

  const imageUrl = item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";

  return (
    <div className="item-card">
      {/* Item Image */}
      <div className="item-card__image-wrapper">
        <img src={imageUrl} alt={item.name} className="item-card__image" />
      </div>

      {/* Item Info */}
      <div className="item-card__content">
        <div>
          <div className="item-card__header">
            <h4 className="item-card__name">{item.name}</h4>
            <span className="item-card__price">
              {formatCurrency(item.price)}
            </span>
          </div>

          {item.description && (
            <p className="item-card__description">
              {item.description}
            </p>
          )}
        </div>

        {/* Rating + Button */}
        <div className="item-card__footer">
          {item.averageRating ? (
            <div className="item-card__rating">
              <Star size={11} fill="#f59e0b" color="#f59e0b" />
              <span className="item-card__rating-value">{item.averageRating.toFixed(1)}</span>
              <span>({item.totalRatings || 0})</span>
            </div>
          ) : (
            <span className="item-card__no-rating">No ratings</span>
          )}

          {inCart ? (
            <button
              onClick={() => removeItem(inCart._id)}
              className="item-card__btn item-card__btn--in-cart"
            >
              <Check size={11} /> In Cart
            </button>
          ) : (
            <button
              onClick={handleAdd}
              className="item-card__btn item-card__btn--add"
            >
              <Plus size={11} /> Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
