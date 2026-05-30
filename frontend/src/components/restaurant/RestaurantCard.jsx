import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Star } from "lucide-react";
import "./RestaurantCard.css";

const RestaurantCard = ({ restaurant }) => {
  const imageUrl = restaurant.restaurantImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80";

  return (
    <div className="restaurant-card">
      {/* Restaurant Image Wrapper */}
      <div className="restaurant-card__image-container">
        <img
          src={imageUrl}
          alt={restaurant.name}
          className="restaurant-card__image"
        />
        {/* Rating Badge */}
        {restaurant.averageRating && (
          <div className="restaurant-card__rating-badge">
            <Star size={12} fill="#f59e0b" color="#f59e0b" />
            {restaurant.averageRating.toFixed(1)}
          </div>
        )}
      </div>

      {/* Restaurant Info */}
      <div className="restaurant-card__content">
        <h3 className="restaurant-card__name">
          {restaurant.name}
        </h3>

        <div className="restaurant-card__location">
          <MapPin size={13} className="restaurant-card__location-icon" />
          <span>{restaurant.city}</span>
        </div>

        {restaurant.description && (
          <p className="restaurant-card__description">
            {restaurant.description}
          </p>
        )}

        <div className="restaurant-card__footer">
          <Link to={`/restaurants/${restaurant._id}`} className="restaurant-card__btn">
            View Menu
          </Link>
        </div>
      </div>
    </div>
  );
};

export default React.memo(RestaurantCard);
