import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Star } from "lucide-react";

const RestaurantCard = ({ restaurant }) => {
  const imageUrl = restaurant.restaurantImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80";

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
      {/* Restaurant Image Wrapper */}
      <div className="relative w-full pt-[56.25%] overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={restaurant.name}
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        {/* Rating Badge */}
        {restaurant.averageRating && (
          <div className="absolute top-3 right-3 bg-gray-900 bg-opacity-80 text-white px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
            <Star size={12} fill="#f59e0b" color="#f59e0b" />
            {restaurant.averageRating.toFixed(1)}
          </div>
        )}
      </div>

      {/* Restaurant Info */}
      <div className="p-4 flex flex-col flex-grow gap-2">
        <h3 className="text-base font-bold text-gray-800 line-clamp-1 m-0">
          {restaurant.name}
        </h3>

        <div className="flex items-center gap-1 text-gray-500 text-xs">
          <MapPin size={13} className="text-orange-600" />
          <span>{restaurant.city}</span>
        </div>

        {restaurant.description && (
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed m-0">
            {restaurant.description}
          </p>
        )}

        <div className="mt-auto pt-3">
          <Link to={`/restaurants/${restaurant._id}`} className="bg-white hover:bg-orange-50 text-orange-600 border border-orange-600 font-semibold py-1.5 px-4 rounded text-xs text-center block no-underline">
            View Menu
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
