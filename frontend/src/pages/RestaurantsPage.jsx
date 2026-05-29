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
  const [error, setError] = useState(false);

  const fetchFilteredRestaurants = async () => {
    setLoading(true);
    setError(false);
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
    } catch (err) {
      console.error("Fetch restaurants failed:", err);
      setError(true);
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
        ) : error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
            <h3 style={{ marginBottom: '12px', color: '#ef4444' }}>Unable to fetch restaurants</h3>
            <p style={{ marginBottom: '20px', color: '#6b7280' }}>Please check your network connection and try again.</p>
            <button 
              onClick={fetchFilteredRestaurants} 
              style={{ padding: '10px 20px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              Retry
            </button>
          </div>
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
