import React, { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { Star, Plus, Check } from "lucide-react";
import formatCurrency from "../../lib/formatCurrency";
import ReviewsModal from "../feedback/ReviewsModal";
import "./ItemCard.css";

const ItemCard = ({ item, isClosed }) => {
  const { addToCart, cartItems, removeItem } = useCart();
  const { isRestaurantStaff } = useAuth();
  const [showReviews, setShowReviews] = useState(false);

  // Compute isClosed dynamically if not passed as prop
  let isClosedFinal = isClosed;
  if (isClosedFinal === undefined && item.restaurant?.openTime && item.restaurant?.closeTime) {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;

      const [openH, openM] = item.restaurant.openTime.split(':').map(Number);
      const [closeH, closeM] = item.restaurant.closeTime.split(':').map(Number);
      const openTime = openH * 60 + openM;
      let closeTime = closeH * 60 + closeM;

      if (closeTime < openTime) {
        if (currentTime < openTime && currentTime > closeTime) {
          isClosedFinal = true;
        } else {
          isClosedFinal = false;
        }
      } else {
        if (currentTime < openTime || currentTime > closeTime) {
          isClosedFinal = true;
        } else {
          isClosedFinal = false;
        }
      }
    } catch (e) {
      console.error("Error parsing operating hours", e);
    }
  }
  if (isClosedFinal === undefined) {
    isClosedFinal = false;
  }

  const inCart = cartItems.find((ci) => ci.itemInfo._id === item._id);

  const handleAdd = async () => {
    await addToCart(item._id);
  };

  const imageUrl = item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";

  return (
    <>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {item.averageRating ? (
              <div 
                className="item-card__rating" 
                onClick={() => setShowReviews(true)}
                style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                title="View reviews"
              >
                <Star size={11} fill="#f59e0b" color="#f59e0b" />
                <span className="item-card__rating-value">{item.averageRating.toFixed(1)}</span>
                <span>({item.totalRatings || 0})</span>
              </div>
            ) : (
              <span className="item-card__no-rating">No ratings</span>
            )}

            {isClosedFinal && (
              <span style={{ 
                color: '#ef4444', 
                backgroundColor: '#fee2e2', 
                padding: '2px 6px', 
                borderRadius: '4px', 
                fontSize: '10px', 
                fontWeight: 'bold'
              }}>
                Closed
              </span>
            )}
          </div>

          {!isRestaurantStaff() && (
            inCart ? (
              <button
                onClick={() => removeItem(inCart._id)}
                className="item-card__btn item-card__btn--in-cart"
              >
                <Check size={11} /> In Cart
              </button>
            ) : (
              <button
                onClick={handleAdd}
                disabled={isClosedFinal}
                className={`item-card__btn item-card__btn--add ${isClosedFinal ? 'item-card__btn--disabled' : ''}`}
                style={{ opacity: isClosedFinal ? 0.5 : 1, cursor: isClosedFinal ? 'not-allowed' : 'pointer' }}
                title={isClosedFinal ? "Restaurant is currently closed" : "Add to cart"}
              >
                <Plus size={11} /> Add
              </button>
            )
          )}
        </div>
      </div>
    </div>
      
      {showReviews && (
        <ReviewsModal 
          itemId={item._id} 
          itemName={item.name} 
          onClose={() => setShowReviews(false)} 
        />
      )}
    </>
  );
};

export default React.memo(ItemCard);
