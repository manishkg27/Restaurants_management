import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart as apiClearCart,
} from "../api/cartAPI";
import { toast } from "react-toastify";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [restaurantName, setRestaurantName] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mismatch modal state
  const [showMismatchModal, setShowMismatchModal] = useState(false);
  const [mismatchData, setMismatchData] = useState(null);

  const fetchCart = async () => {
    if (!user) {
      setCartItems([]);
      setCartTotal(0);
      setRestaurantName(null);
      return;
    }
    setLoading(true);
    try {
      const response = await getCart();
      if (response.success && response.data) {
        setCartItems(response.data.items);
        setCartTotal(response.data.cartTotal);
        setRestaurantName(response.data.restaurantName);
      }
    } catch (error) {
      console.error("Fetch cart failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (itemId) => {
    if (!user) {
      toast.warning("Please login to add items to cart!");
      return { success: false, loginRequired: true };
    }
    try {
      const response = await apiAddToCart(itemId);
      if (response.success) {
        toast.success(response.message || "Added to cart!");
        await fetchCart();
        return { success: true };
      }
    } catch (error) {
      if (error.response && error.response.status === 409 && error.response.data.conflict === "RESTAURANT_MISMATCH") {
        // Show Restaurant Mismatch Dialog
        setMismatchData({
          itemId,
          currentRestaurant: error.response.data.currentRestaurant,
          newRestaurant: error.response.data.newRestaurant,
        });
        setShowMismatchModal(true);
        return { success: false, mismatch: true };
      } else {
        toast.error(error.response?.data?.message || "Failed to add item to cart");
        return { success: false };
      }
    }
  };

  const removeItem = async (cartId) => {
    try {
      const response = await removeFromCart(cartId);
      if (response.success) {
        toast.success("Item removed from cart");
        await fetchCart();
      }
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const updateQty = async (cartId, quantity) => {
    try {
      const response = await updateCartQuantity(cartId, quantity);
      if (response.success) {
        await fetchCart();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update quantity");
    }
  };

  const clearCart = async () => {
    try {
      const response = await apiClearCart();
      if (response.success) {
        setCartItems([]);
        setCartTotal(0);
        setRestaurantName(null);
        return { success: true };
      }
    } catch (error) {
      toast.error("Failed to clear cart");
      return { success: false };
    }
  };

  const confirmMismatchAction = async () => {
    if (!mismatchData) return;
    try {
      // 1. Clear cart
      const clearRes = await apiClearCart();
      if (clearRes.success) {
        // 2. Retry add
        const addRes = await apiAddToCart(mismatchData.itemId);
        if (addRes.success) {
          toast.success("Cart replaced with new restaurant item!");
          setShowMismatchModal(false);
          setMismatchData(null);
          await fetchCart();
        }
      }
    } catch (error) {
      toast.error("Failed to clear and update cart");
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const value = {
    cartItems,
    cartTotal,
    cartCount,
    restaurantName,
    loading,
    showMismatchModal,
    setShowMismatchModal,
    mismatchData,
    addToCart,
    removeItem,
    updateQty,
    clearCart,
    confirmMismatchAction,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
