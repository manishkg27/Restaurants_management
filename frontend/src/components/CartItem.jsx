import React from "react";
import { useCart } from "../context/CartContext";
import { Plus, Minus, Trash2 } from "lucide-react";
import formatCurrency from "../utils/formatCurrency";

const CartItem = ({ item }) => {
  const { updateQty, removeItem } = useCart();

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQty(item._id, item.quantity - 1);
    } else {
      removeItem(item._id);
    }
  };

  const handleIncrease = () => {
    updateQty(item._id, item.quantity + 1);
  };

  const imageUrl = item.itemInfo.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80";

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100">
      <img
        src={imageUrl}
        alt={item.itemInfo.name}
        className="w-10 h-10 object-cover rounded border border-gray-200"
      />

      <div className="flex-grow min-w-0">
        <h5 className="text-xs font-bold text-gray-800 m-0 truncate">
          {item.itemInfo.name}
        </h5>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-bold text-orange-600">
            {formatCurrency(item.itemInfo.price)}
          </span>
          <span className="text-xxs text-gray-400">
            x {item.quantity}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Quantity Controls */}
        <div className="flex items-center border border-gray-300 rounded bg-gray-50 overflow-hidden">
          <button
            onClick={handleDecrease}
            className="bg-transparent border-none cursor-pointer p-1 text-gray-500 hover:bg-gray-200 flex items-center justify-center"
          >
            <Minus size={10} />
          </button>
          <span className="px-1.5 text-xs font-bold min-w-[14px] text-center text-gray-700">
            {item.quantity}
          </span>
          <button
            onClick={handleIncrease}
            className="bg-transparent border-none cursor-pointer p-1 text-gray-500 hover:bg-gray-200 flex items-center justify-center"
          >
            <Plus size={10} />
          </button>
        </div>

        {/* Delete button */}
        <button
          onClick={() => removeItem(item._id)}
          className="bg-transparent border-none cursor-pointer text-red-500 hover:bg-red-50 p-1.5 rounded flex items-center justify-center"
          title="Remove Item"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
