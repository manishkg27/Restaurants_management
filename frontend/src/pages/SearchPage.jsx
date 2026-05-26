import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchItems } from "../api/itemAPI";
import ItemCard from "../components/ItemCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { Search, MapPin, SlidersHorizontal } from "lucide-react";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("query") || "";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [itemName, setItemName] = useState(initialQuery);
  const [restaurantName, setRestaurantName] = useState("");
  const [location, setLocation] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ query: itemName });
    fetchResults();
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await searchItems({
        itemName: itemName.trim() || undefined,
        restaurantName: restaurantName.trim() || undefined,
        location: location.trim() || undefined,
      });
      if (response.success) {
        setItems(response.data || []);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [initialQuery]);

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col gap-8">
          {/* Search Filters Card */}
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col gap-4"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-orange-600" />
              <h3 className="text-sm font-bold text-gray-800 m-0">
                Refine Search Filters
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700">Dish Name</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-xs text-gray-800 outline-none focus:border-blue-500 bg-white"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. Pizza, Burger..."
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700">Restaurant Name</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-xs text-gray-800 outline-none focus:border-blue-500 bg-white"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="e.g. Gourmet Hub..."
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700">Location / City</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-xs text-gray-800 outline-none focus:border-blue-500 bg-white"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Mumbai, Delhi..."
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded text-xs cursor-pointer border-none self-end mt-2">
              Apply Filters
            </button>
          </form>

          {/* Results Grid */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Search Results
            </h2>

            {loading ? (
              <LoadingSpinner />
            ) : items.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-gray-500 text-xs shadow-sm">
                No dishes found matching your search parameters.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {items.map((item) => (
                  <ItemCard key={item._id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
