import React from "react";
import { useCart } from "../context/CartContext";
import { AlertTriangle, X } from "lucide-react";

const RestaurantMismatchModal = () => {
  const { showMismatchModal, setShowMismatchModal, mismatchData, confirmMismatchAction } = useCart();

  if (!showMismatchModal || !mismatchData) return null;

  const { currentRestaurant, newRestaurant } = mismatchData;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-65 z-[10000] flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 max-w-sm w-full relative">
        <button
          onClick={() => setShowMismatchModal(false)}
          className="absolute top-4 right-4 bg-transparent border-none cursor-pointer text-gray-400 hover:text-gray-600 p-1"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>

          <h3 className="text-base font-bold text-gray-900 m-0">
            Replace cart items?
          </h3>

          <p className="text-xs text-gray-500 leading-relaxed m-0">
            Your cart already contains items from <strong className="text-orange-600">{currentRestaurant?.name}</strong>.
            Adding items from <strong className="text-gray-800">{newRestaurant?.name}</strong> will discard your existing selections.
          </p>

          <div className="flex flex-col w-full gap-2 mt-4">
            <button
              onClick={confirmMismatchAction}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded text-xs cursor-pointer border-none"
            >
              Clear Cart & Add Item
            </button>
            <button
              onClick={() => setShowMismatchModal(false)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 font-bold py-2 rounded text-xs cursor-pointer"
            >
              Keep Current Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantMismatchModal;
