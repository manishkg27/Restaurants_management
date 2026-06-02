import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchItems } from "../../api/itemAPI";
import ItemCard from "../../components/restaurant/ItemCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import "./SearchPage.css";
import { Search, MapPin, SlidersHorizontal } from "lucide-react";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("search") || searchParams.get("query") || "";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [itemName, setItemName] = useState(initialQuery);
  const [restaurantName, setRestaurantName] = useState("");
  const [location, setLocation] = useState("");
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [sortBy, setSortBy] = useState("rating");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ search: itemName });
    fetchResults();
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await searchItems({
        search: itemName.trim() || undefined,
        restaurantName: restaurantName.trim() || undefined,
        location: location.trim() || undefined,
        isVegetarian: isVegetarian ? 'true' : undefined,
        sortBy: sortBy,
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
    const handler = setTimeout(() => {
      if (itemName) {
        setSearchParams({ search: itemName });
      } else {
        setSearchParams({});
      }
      fetchResults();
    }, 500);

    return () => clearTimeout(handler);
  }, [itemName, restaurantName, location, isVegetarian, sortBy]);

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

              <div className="search-page__form-group">
                <label className="search-page__label">Sort By</label>
                <div className="search-page__input-wrapper">
                  <select
                    className="search-page__input"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{ appearance: 'auto' }}
                  >
                    <option value="rating">Rating (High to Low)</option>
                    <option value="price_low">Price (Low to High)</option>
                    <option value="price_high">Price (High to Low)</option>
                  </select>
                </div>
              </div>

              <div className="search-page__form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <input
                  id="searchVegOnly"
                  type="checkbox"
                  checked={isVegetarian}
                  onChange={(e) => setIsVegetarian(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#22c55e' }}
                />
                <label className="search-page__label" htmlFor="searchVegOnly" style={{ margin: 0, cursor: 'pointer', marginBottom: 0 }}>
                  Vegetarian Only
                </label>
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
