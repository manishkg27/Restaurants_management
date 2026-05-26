import React, { useEffect, useState } from "react";
import { getRestaurants } from "../api/restaurantAPI";
import RestaurantCard from "../components/RestaurantCard";
import LoadingSpinner from "../components/LoadingSpinner";
import "./RestaurantsPage.css";
import { Search, MapPin } from "lucide-react";

const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFilteredRestaurants = async () => {
    setLoading(true);
    try {
      const response = await getRestaurants({
        search: search.trim() || undefined,
        city: city.trim() || undefined,
        page,
        limit: 9,
      });
      if (response.success) {
        setRestaurants(response.data || []);
        setTotalPages(response.totalPages || 1);
      }
    } catch (error) {
      console.error("Fetch restaurants failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredRestaurants();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchFilteredRestaurants();
  };

  return (
    <div className="restaurants">
      <div className="restaurants__container">
        {/* Filters Header Card */}
        <div className="restaurants__header">
          <div>
            <h2 className="restaurants__title">
              Explore Restaurants
            </h2>
            <p className="restaurants__subtitle">
              Find the perfect gourmet spot for your dining mood
            </p>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="restaurants__form"
          >
            <div className="restaurants__input-wrapper">
              <Search size={14} className="restaurants__input-icon" />
              <input
                type="text"
                placeholder="Search restaurant..."
                className="restaurants__input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="restaurants__input-wrapper">
              <MapPin size={14} className="restaurants__input-icon" />
              <input
                type="text"
                placeholder="Filter by city..."
                className="restaurants__input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <button type="submit" className="restaurants__button">
              Search
            </button>
          </form>
        </div>

        {/* Content Listing */}
        {loading ? (
          <LoadingSpinner />
        ) : restaurants.length === 0 ? (
          <div className="restaurants__empty">
            No restaurants found matching your filters.
          </div>
        ) : (
          <>
            <div className="restaurants__grid">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant._id} restaurant={restaurant} />
              ))}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="restaurants__pagination">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="restaurants__pagination-btn"
                >
                  Previous
                </button>
                <span className="restaurants__pagination-text">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="restaurants__pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RestaurantsPage;
