import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getRestaurantById } from "../api/restaurantAPI";
import ItemCard from "../components/ItemCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { MapPin, Star, Phone, ArrowLeft } from "lucide-react";

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await getRestaurantById(id);
        if (response.success) {
          setRestaurant(response.data);
        }
      } catch (error) {
        console.error("Fetch restaurant details failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
  }, [id]);

  if (loading) return <LoadingSpinner fullPage />;
  if (!restaurant) {
    return (
      <div className="bg-gray-50 min-h-screen py-20 text-center">
        <h3 className="text-lg font-bold text-gray-800">Restaurant not found</h3>
        <Link to="/restaurants" className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-5 rounded text-sm no-underline mt-4 inline-block">
          Back to Restaurants
        </Link>
      </div>
    );
  }

  const imageUrl = restaurant.restaurantImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Simple Flat Header Wrapper */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <Link
            to="/restaurants"
            className="text-orange-600 hover:text-orange-700 font-semibold text-xs flex items-center gap-1 no-underline mb-4"
          >
            <ArrowLeft size={14} /> Back to Restaurants List
          </Link>

          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Restaurant Thumbnail */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg border border-gray-300 overflow-hidden flex-shrink-0 bg-gray-100">
              <img src={imageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
            </div>

            {/* Restaurant Info */}
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 m-0">
                {restaurant.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-gray-500 font-medium mt-1">
                <div className="flex items-center gap-1">
                  <MapPin size={15} className="text-orange-600" />
                  <span>
                    {restaurant.location || restaurant.city}, {restaurant.city}
                  </span>
                </div>

                {restaurant.contactNumber && (
                  <div className="flex items-center gap-1">
                    <Phone size={15} className="text-orange-600" />
                    <span>{restaurant.contactNumber}</span>
                  </div>
                )}

                {restaurant.averageRating && (
                  <div className="flex items-center gap-1">
                    <Star size={15} fill="#f59e0b" className="text-yellow-500" />
                    <span className="font-bold text-gray-800">{restaurant.averageRating.toFixed(1)} Rating</span>
                  </div>
                )}
              </div>

              {restaurant.description && (
                <p className="text-xs text-gray-600 mt-2 max-w-2xl leading-relaxed m-0">
                  {restaurant.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Listing Container */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-6">Our Menu Dishes</h2>

          {!restaurant.menuItems || restaurant.menuItems.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-400 text-xs shadow-sm">
              This restaurant has not listed any menu items yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {restaurant.menuItems.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetailPage;
