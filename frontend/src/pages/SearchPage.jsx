import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchItems } from "../api/itemAPI";
import ItemCard from "../components/ItemCard";
import LoadingSpinner from "../components/LoadingSpinner";
import "./SearchPage.css";
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
    <div className="search-page">
      <div className="search-page__container">
        <div className="search-page__layout">
          {/* Search Filters Card */}
          <form
            onSubmit={handleSearchSubmit}
            className="search-page__form"
          >
            <div className="search-page__form-header">
              <SlidersHorizontal size={16} className="search-page__form-icon" />
              <h3 className="search-page__form-title">
                Refine Search Filters
              </h3>
            </div>

            <div className="search-page__form-grid">
              <div className="search-page__form-group">
                <label className="search-page__label">Dish Name</label>
                <div className="search-page__input-wrapper">
                  <Search size={14} className="search-page__input-icon" />
                  <input
                    type="text"
                    className="search-page__input"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. Pizza, Burger..."
                  />
                </div>
              </div>

              <div className="search-page__form-group">
                <label className="search-page__label">Restaurant Name</label>
                <div className="search-page__input-wrapper">
                  <Search size={14} className="search-page__input-icon" />
                  <input
                    type="text"
                    className="search-page__input"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="e.g. Gourmet Hub..."
                  />
                </div>
              </div>

              <div className="search-page__form-group">
                <label className="search-page__label">Location / City</label>
                <div className="search-page__input-wrapper">
                  <MapPin size={14} className="search-page__input-icon" />
                  <input
                    type="text"
                    className="search-page__input"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Mumbai, Delhi..."
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="search-page__button">
              Apply Filters
            </button>
          </form>

          {/* Results Grid */}
          <div>
            <h2 className="search-page__results-title">
              Search Results
            </h2>

            {loading ? (
              <LoadingSpinner />
            ) : items.length === 0 ? (
              <div className="search-page__empty">
                No dishes found matching your search parameters.
              </div>
            ) : (
              <div className="search-page__results-grid">
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
