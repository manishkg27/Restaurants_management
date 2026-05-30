import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getRestaurantById } from "../../api/restaurantAPI";
import ItemCard from "../../components/restaurant/ItemCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import "./RestaurantDetailPage.css";
import { MapPin, Star, Phone, ArrowLeft, Clock } from "lucide-react";

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
      <div className="restaurant-detail__not-found">
        <h3 className="restaurant-detail__not-found-title">Restaurant not found</h3>
        <Link to="/restaurants" className="restaurant-detail__not-found-link">
          Back to Restaurants
        </Link>
      </div>
    );
  }

  const imageUrl = restaurant.restaurantImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80";

  // Helper to check if closed
  let isClosed = false;
  if (restaurant.openTime && restaurant.closeTime) {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;

      const [openH, openM] = restaurant.openTime.split(':').map(Number);
      const [closeH, closeM] = restaurant.closeTime.split(':').map(Number);
      const openTime = openH * 60 + openM;
      let closeTime = closeH * 60 + closeM;

      // Handle overnight shifts (e.g. 20:00 to 02:00)
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

  return (
    <div className="restaurant-detail">
      {/* Simple Flat Header Wrapper */}
      <div className="restaurant-detail__header-wrapper">
        <div className="restaurant-detail__container">
          <Link
            to="/restaurants"
            className="restaurant-detail__back-link"
          >
            <ArrowLeft size={14} /> Back to Restaurants List
          </Link>

          <div className="restaurant-detail__header-content">
            {/* Restaurant Thumbnail */}
            <div className="restaurant-detail__image-container">
              <img src={imageUrl} alt={restaurant.name} className="restaurant-detail__image" />
            </div>

            {/* Restaurant Info */}
            <div className="restaurant-detail__info">
              <h1 className="restaurant-detail__name">
                {restaurant.name}
              </h1>

              <div className="restaurant-detail__meta">
                <div className="restaurant-detail__meta-item">
                  <MapPin size={15} className="restaurant-detail__meta-icon" />
                  <span>
                    {restaurant.location || restaurant.city}, {restaurant.city}
                  </span>
                </div>

                {restaurant.contactNumber && (
                  <div className="restaurant-detail__meta-item">
                    <Phone size={15} className="restaurant-detail__meta-icon" />
                    <span>{restaurant.contactNumber}</span>
                  </div>
                )}

                {restaurant.averageRating && (
                  <div className="restaurant-detail__meta-item">
                    <Star size={15} fill="#f59e0b" className="restaurant-detail__star" />
                    <span className="restaurant-detail__rating-text">{restaurant.averageRating.toFixed(1)} Rating</span>
                  </div>
                )}
                
                {restaurant.openTime && restaurant.closeTime && (
                  <div className="restaurant-detail__meta-item">
                    <Clock size={15} className="restaurant-detail__meta-icon" />
                    <span>{restaurant.openTime} - {restaurant.closeTime}</span>
                    <span style={{ 
                      marginLeft: '10px', 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px', 
                      fontWeight: 'bold',
                      backgroundColor: isClosed ? '#fee2e2' : '#d1fae5',
                      color: isClosed ? '#dc2626' : '#059669'
                    }}>
                      {isClosed ? 'Closed' : 'Open'}
                    </span>
                  </div>
                )}
              </div>

              {restaurant.description && (
                <p className="restaurant-detail__description">
                  {restaurant.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Listing Container */}
      <div className="restaurant-detail__container restaurant-detail__menu-container">
        <div>
          <h2 className="restaurant-detail__menu-title">Our Menu Dishes</h2>

          {!restaurant.menuItems || restaurant.menuItems.length === 0 ? (
            <div className="restaurant-detail__empty">
              This restaurant has not listed any menu items yet.
            </div>
          ) : (
            <div className="restaurant-detail__grid">
              {restaurant.menuItems.map((item) => (
                <ItemCard key={item._id} item={item} isClosed={isClosed} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetailPage;
