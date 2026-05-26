import React, { useEffect, useState } from "react";
import { getRestaurants } from "../api/restaurantAPI";
import RestaurantCard from "../components/RestaurantCard";
import LoadingSpinner from "../components/LoadingSpinner";
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
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* Filters Header Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 m-0">
              Explore Restaurants
            </h2>
            <p className="text-xs text-gray-500 m-0 mt-1">
              Find the perfect gourmet spot for your dining mood
            </p>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-wrap gap-3 items-center flex-grow md:flex-grow-0 justify-end w-full md:max-w-lg"
          >
            <div className="relative flex-grow min-w-[150px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search restaurant..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-xs text-gray-800 outline-none focus:border-blue-500 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="relative flex-grow min-w-[120px]">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Filter by city..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-xs text-gray-800 outline-none focus:border-blue-500 bg-white"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded text-xs cursor-pointer border-none flex-shrink-0">
              Search
            </button>
          </form>
        </div>

        {/* Content Listing */}
        {loading ? (
          <LoadingSpinner />
        ) : restaurants.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-gray-500 text-sm shadow-sm">
            No restaurants found matching your filters.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant._id} restaurant={restaurant} />
              ))}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-10">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 font-semibold py-1.5 px-4 rounded text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 font-semibold py-1.5 px-4 rounded text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
