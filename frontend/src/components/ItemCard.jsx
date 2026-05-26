import React from "react";
import { useCart } from "../context/CartContext";
import { Star, Plus, Check } from "lucide-react";
import formatCurrency from "../utils/formatCurrency";

const ItemCard = ({ item }) => {
  const { addToCart, cartItems, removeItem } = useCart();

  const inCart = cartItems.find((ci) => ci.itemInfo._id === item._id);

  const handleAdd = async () => {
    await addToCart(item._id);
  };

  const imageUrl = item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex gap-4 h-full">
      {/* Item Image */}
      <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0 bg-gray-100">
        <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
      </div>

      {/* Item Info */}
      <div className="flex flex-col flex-grow justify-between">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h4 className="text-sm font-bold text-gray-800 m-0">{item.name}</h4>
            <span className="text-sm font-bold text-orange-600 flex-shrink-0">
              {formatCurrency(item.price)}
            </span>
          </div>

          {item.description && (
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed m-0 mt-1">
              {item.description}
            </p>
          )}
        </div>

        {/* Rating + Button */}
        <div className="flex justify-between items-center mt-2">
          {item.averageRating ? (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Star size={11} fill="#f59e0b" color="#f59e0b" />
              <span className="font-bold text-gray-700">{item.averageRating.toFixed(1)}</span>
              <span>({item.totalRatings || 0})</span>
            </div>
          ) : (
            <span className="text-xxs text-gray-400">No ratings</span>
          )}

          {inCart ? (
            <button
              onClick={() => removeItem(inCart._id)}
              className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-300 font-semibold py-1 px-3 rounded text-xs flex items-center gap-1 cursor-pointer"
            >
              <Check size={11} /> In Cart
            </button>
          ) : (
            <button
              onClick={handleAdd}
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-1 px-3 rounded text-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus size={11} /> Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
