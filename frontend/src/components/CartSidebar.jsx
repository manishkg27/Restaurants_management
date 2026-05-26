import React from "react";
import { useCart } from "../context/CartContext";
import CartItem from "./CartItem";
import { X, ShoppingBag, Trash2 } from "lucide-react";
import formatCurrency from "../utils/formatCurrency";
import { useNavigate } from "react-router-dom";

const CartSidebar = ({ isOpen, onClose }) => {
  const { cartItems, cartTotal, restaurantName, clearCart } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckoutClick = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex justify-end"
      onClick={onClose}
    >
      {/* Sidebar Panel */}
      <div
        className="w-full max-w-sm bg-white h-full flex flex-col p-6 shadow-lg border-l border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-orange-600" />
            <h3 className="text-sm font-bold text-gray-800 m-0">My Cart</h3>
          </div>
          <button
            onClick={onClose}
            className="bg-transparent border-none cursor-pointer text-gray-400 hover:text-gray-600 flex items-center justify-center p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Restaurant Name */}
        {restaurantName && (
          <div className="bg-orange-50 text-orange-700 p-2.5 rounded text-xs font-semibold mb-4 border border-orange-200">
            Ordering from: {restaurantName}
          </div>
        )}

        {/* Scrollable list */}
        <div className="flex-grow overflow-y-auto pr-1">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-400">
              <ShoppingBag size={36} strokeWidth={1.5} />
              <p className="text-xs">Your cart is empty</p>
            </div>
          ) : (
            cartItems.map((item) => <CartItem key={item._id} item={item} />)
          )}
        </div>

        {/* Footer info */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 pt-5 mt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-gray-600 font-semibold">Total Amount:</span>
              <span className="text-base font-extrabold text-orange-600">
                {formatCurrency(cartTotal)}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={clearCart}
                className="bg-gray-100 hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-gray-600 border border-gray-300 p-2.5 rounded cursor-pointer flex items-center justify-center"
                title="Clear Cart"
              >
                <Trash2 size={15} />
              </button>
              <button
                onClick={handleCheckoutClick}
                className="flex-grow bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded text-sm cursor-pointer border-none"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
