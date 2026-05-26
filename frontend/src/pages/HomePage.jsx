import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getRestaurants } from "../api/restaurantAPI";
import { getItems } from "../api/itemAPI";
import RestaurantCard from "../components/RestaurantCard";
import ItemCard from "../components/ItemCard";
import { Search, Sparkles, ChefHat } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import "./HomePage.css";

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const categories = [
    { name: "Pizza", emoji: "🍕" },
    { name: "Burger", emoji: "🍔" },
    { name: "Drinks", emoji: "🥤" },
    { name: "Biryani", emoji: "🍛" }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const restRes = await getRestaurants({ limit: 6 });
        const itemsRes = await getItems();
        if (restRes.success) setRestaurants(restRes.data || []);
        if (itemsRes.success) {
          const sortedItems = (itemsRes.data || [])
            .filter((item) => item.averageRating)
            .sort((a, b) => b.averageRating - a.averageRating)
            .slice(0, 4);
          setItems(sortedItems);
        }
      } catch (error) {
        console.error("Home page fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/search?query=${encodeURIComponent(categoryName)}`);
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="home">
      {/* Simple Clean Hero Section */}
      <section className="home__hero">
        <div className="home__hero-content">
          
          {user && user.role === "owner" && (
            <div className="home__owner-alert">
              <ChefHat size={14} />
              <span>Owner Account Verified! Go to your </span>
              <Link to="/owner/dashboard" className="home__owner-link">
                Dashboard
              </Link>
            </div>
          )}

          <div className="home__badge">
            <Sparkles size={11} className="home__badge-icon" />
            <span>Eatify final-year student project template</span>
          </div>

          <h1 className="home__title">
            Find Your Favorite Food
          </h1>

          <p className="home__subtitle">
            Discover the best local cuisines, check out menu items, and place orders directly to your doorstep.
          </p>

          {/* Search form */}
          <form
            onSubmit={handleSearchSubmit}
            className="home__search-form"
          >
            <div className="home__search-input-wrapper">
              <Search size={14} className="home__search-icon" />
              <input
                type="text"
                placeholder="Search dishes, cuisines, or restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="home__search-input"
              />
            </div>
            <button type="submit" className="home__search-button">
              Search
            </button>
          </form>

          {/* Food Categories Selector Chips */}
          <div className="home__categories">
            <span className="home__categories-title">
              Quick Categories
            </span>
            <div className="home__categories-list">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="home__category-btn"
                >
                  <span className="home__category-emoji">{cat.emoji}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Restaurants Section */}
      <section className="home__restaurants">
        <div className="home__restaurants-header">
          <div>
            <h2 className="home__restaurants-title">Featured Restaurants</h2>
            <p className="home__restaurants-subtitle">Eateries registered in the MERN database system</p>
          </div>
          <Link to="/restaurants" className="home__restaurants-link">
            View All
          </Link>
        </div>

        {restaurants.length === 0 ? (
          <p className="home__no-restaurants">No restaurants found in database.</p>
        ) : (
          <div className="home__restaurants-grid">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant._id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </section>

      {/* Top Rated Items Section */}
      {items.length > 0 && (
        <section className="home__items">
          <div className="home__items-container">
            <div className="home__items-header">
              <h2 className="home__items-title">Popular Customer Choices</h2>
              <p className="home__items-subtitle">Gourmet delicacies ordered and highly rated by users</p>
            </div>

            <div className="home__items-grid">
              {items.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
