import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getRestaurants } from "../api/restaurantAPI";
import { getItems } from "../api/itemAPI";
import RestaurantCard from "../components/RestaurantCard";
import ItemCard from "../components/ItemCard";
import { Search, Sparkles, ChefHat } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";

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
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Simple Clean Hero Section */}
      <section className="bg-white border-b border-gray-200 py-10 md:py-14 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center text-center gap-4">
          
          {user && user.role === "owner" && (
            <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-2 rounded-md text-xs font-semibold mb-2 flex items-center gap-2">
              <ChefHat size={14} />
              <span>Owner Account Verified! Go to your </span>
              <Link to="/owner/dashboard" className="text-gray-900 font-bold underline hover:text-orange-600">
                Dashboard
              </Link>
            </div>
          )}

          <div className="bg-gray-100 border border-gray-200 px-3 py-1 rounded-full text-xxs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
            <Sparkles size={11} className="text-orange-600" />
            <span>Eatify final-year student project template</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight m-0">
            Find Your Favorite Food
          </h1>

          <p className="text-xs md:text-sm text-gray-500 max-w-lg leading-relaxed m-0">
            Discover the best local cuisines, check out menu items, and place orders directly to your doorstep.
          </p>

          {/* Search form */}
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white border border-gray-300 shadow-sm rounded-md flex w-full max-w-md p-1 mt-3"
          >
            <div className="flex items-center flex-grow px-3 gap-2">
              <Search size={14} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search dishes, cuisines, or restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-none bg-transparent outline-none w-full text-xs text-gray-800"
              />
            </div>
            <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-5 rounded text-xs cursor-pointer border-none flex-shrink-0">
              Search
            </button>
          </form>

          {/* Food Categories Selector Chips */}
          <div className="mt-8 w-full max-w-md">
            <span className="text-xxs font-bold text-gray-400 uppercase tracking-widest block mb-3 text-center">
              Quick Categories
            </span>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="bg-white hover:bg-orange-50 border border-gray-200 hover:border-orange-300 text-gray-700 hover:text-orange-700 font-semibold px-4 py-2 rounded-full text-xs flex items-center gap-2 cursor-pointer shadow-xs transition"
                >
                  <span className="text-base">{cat.emoji}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Restaurants Section */}
      <section className="py-10 max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 m-0">Featured Restaurants</h2>
            <p className="text-xs text-gray-500 m-0 mt-1">Eateries registered in the MERN database system</p>
          </div>
          <Link to="/restaurants" className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-1.5 px-4 rounded text-xs no-underline border border-gray-300">
            View All
          </Link>
        </div>

        {restaurants.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-8 bg-white border border-gray-200 rounded p-6 shadow-sm">No restaurants found in database.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant._id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </section>

      {/* Top Rated Items Section */}
      {items.length > 0 && (
        <section className="py-10 bg-white border-t border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-lg font-bold text-gray-900 m-0">Popular Customer Choices</h2>
              <p className="text-xs text-gray-500 m-0 mt-1">Gourmet delicacies ordered and highly rated by users</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
