const Cart = require("../models/Cart");
const Item = require("../models/Item");
const Restaurant = require("../models/Restaurant");
const mongoose = require("mongoose");

// @desc    Add item to cart (Enforces Single-Restaurant Rule)
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { itemId } = req.body;
    const userId = req.user._id;

    const item = await Item.findById(itemId);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    const restaurant = await Restaurant.findById(item.restaurant);
    if (!restaurant || restaurant.status === "deleted") {
      return res
        .status(400)
        .json({ success: false, message: "This restaurant is no longer active" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (cart) {
      // Conflict Detection: If cart has items from a different restaurant
      if (cart.restaurant.toString() !== item.restaurant.toString()) {
        if (cart.items.length > 0) {
          const currentRestaurant = await Restaurant.findById(
            cart.restaurant
          ).select("name");
          const newRestaurant = { name: restaurant.name, _id: restaurant._id };
          
          return res.status(409).json({
            success: false,
            conflict: "RESTAURANT_MISMATCH",
            message:
              "Your cart contains items from a different restaurant. Clear cart to add this item.",
            currentRestaurant,
            newRestaurant,
          });
        } else {
          // If cart is empty but belongs to a different restaurant (edge case), update it
          cart.restaurant = item.restaurant;
        }
      }

      // Duplicate Check
      const existingItemIndex = cart.items.findIndex(
        (cartItem) => cartItem.item.toString() === itemId
      );

      if (existingItemIndex > -1) {
        return res
          .status(400)
          .json({ success: false, message: "Item is already in your cart" });
      }

      cart.items.push({ item: itemId, quantity: 1 });
      await cart.save();
    } else {
      // Create new cart
      cart = await Cart.create({
        user: userId,
        restaurant: item.restaurant,
        items: [{ item: itemId, quantity: 1 }],
      });
    }

    res
      .status(201)
      .json({ success: true, data: cart, message: "Item added to cart" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all cart items for user with populated details
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId })
      .populate("restaurant", "name")
      .populate("items.item", "name price image");

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.json({
        success: true,
        data: {
          items: [],
          cartTotal: 0,
          restaurantName: null,
        },
      });
    }

    let cartTotal = 0;
    const formattedItems = cart.items.map((cartItem) => {
      // Handle cases where item might have been deleted from DB
      if (!cartItem.item) return null;
      
      const lineTotal = cartItem.quantity * cartItem.item.price;
      cartTotal += lineTotal;
      return {
        _id: cartItem._id,
        quantity: cartItem.quantity,
        lineTotal,
        itemInfo: {
          _id: cartItem.item._id,
          name: cartItem.item.name,
          price: cartItem.item.price,
          image: cartItem.item.image,
        },
        restaurantInfo: {
          _id: cart.restaurant._id,
          name: cart.restaurant.name,
        },
      };
    }).filter(Boolean);

    res.json({
      success: true,
      data: {
        items: formattedItems,
        cartTotal,
        restaurantName: cart.restaurant.name,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update quantity of a cart item
// @route   PATCH /api/cart/:cartId
// @access  Private
const updateCartQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cartId = req.params.cartId; // This is the subdocument _id in the items array

    if (quantity < 1 || quantity > 50) {
      return res
        .status(400)
        .json({ success: false, message: "Quantity must be between 1 and 50" });
    }

    const updatedCart = await Cart.findOneAndUpdate(
      { user: req.user._id, "items._id": cartId },
      { $set: { "items.$.quantity": quantity } },
      { new: true, runValidators: true }
    );

    if (!updatedCart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart item not found" });
    }

    res.json({ success: true, data: updatedCart, message: "Cart updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove a single item from cart
// @route   DELETE /api/cart/:cartId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const cartId = req.params.cartId;

    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { items: { _id: cartId } } },
      { new: true }
    );

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }
    
    // Optionally remove the cart if it's empty
    if (cart.items.length === 0) {
      await Cart.findOneAndDelete({ user: req.user._id });
    }

    res.json({ success: true, message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear entire cart (Used when user confirms restaurant switch)
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = async (req, res) => {
  try {
    const result = await Cart.findOneAndDelete({ user: req.user._id });
    res.json({
      success: true,
      message: "Cart cleared successfully",
      deletedCount: result ? 1 : 0,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
};
