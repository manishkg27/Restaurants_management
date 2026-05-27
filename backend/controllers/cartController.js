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

    // 1. Fetch the item to get its restaurant association
    const item = await Item.findById(itemId);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    // 2. Check user's current cart state
    const existingCartItem = await Cart.findOne({ user: userId });

    // 3. Conflict Detection: If cart has items from a different restaurant
    if (
      existingCartItem &&
      existingCartItem.restaurant.toString() !== item.restaurant.toString()
    ) {
      const currentRestaurant = await Restaurant.findById(
        existingCartItem.restaurant,
      ).select("name");
      const newRestaurant = await Restaurant.findById(item.restaurant).select(
        "name",
      );

      return res.status(409).json({
        success: false,
        conflict: "RESTAURANT_MISMATCH",
        message:
          "Your cart contains items from a different restaurant. Clear cart to add this item.",
        currentRestaurant,
        newRestaurant,
      });
    }

    // 4. Duplicate Check: Prevent adding the exact same item twice
    const duplicateItem = await Cart.findOne({ user: userId, item: itemId });
    if (duplicateItem) {
      return res
        .status(400)
        .json({ success: false, message: "Item is already in your cart" });
    }

    // 5. Success: Create cart entry
    const cartEntry = await Cart.create({
      user: userId,
      item: itemId,
      restaurant: item.restaurant,
      quantity: 1,
    });

    res
      .status(201)
      .json({ success: true, data: cartEntry, message: "Item added to cart" });
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

    // Using MongoDB Aggregation Pipeline from the DDD
    const cartItems = await Cart.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "items",
          localField: "item",
          foreignField: "_id",
          as: "itemInfo",
        },
      },
      { $unwind: "$itemInfo" },
      {
        $lookup: {
          from: "restaurants",
          localField: "restaurant",
          foreignField: "_id",
          as: "restaurantInfo",
        },
      },
      { $unwind: "$restaurantInfo" },
      {
        $addFields: {
          lineTotal: { $multiply: ["$quantity", "$itemInfo.price"] },
        },
      },
      {
        $project: {
          quantity: 1,
          lineTotal: 1,
          "itemInfo.name": 1,
          "itemInfo.price": 1,
          "itemInfo.image": 1,
          "itemInfo._id": 1,
          "restaurantInfo.name": 1,
          "restaurantInfo._id": 1,
        },
      },
    ]);

    let cartTotal = 0;
    let restaurantName = null;

    if (cartItems.length > 0) {
      cartTotal = cartItems.reduce((acc, item) => acc + item.lineTotal, 0);
      restaurantName = cartItems[0].restaurantInfo.name;
    }

    res.json({
      success: true,
      data: {
        items: cartItems,
        cartTotal,
        restaurantName,
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

    if (quantity < 1 || quantity > 50) {
      return res
        .status(400)
        .json({ success: false, message: "Quantity must be between 1 and 50" });
    }

    const updatedCart = await Cart.findOneAndUpdate(
      { _id: req.params.cartId, user: req.user._id },
      { quantity },
      { returnDocument: 'after', runValidators: true },
    );

    if (!updatedCart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart item not found" });
    }

    res.json({ success: true, data: updatedCart, message: "Cart updated" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Remove a single item from cart
// @route   DELETE /api/cart/:cartId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const deletedCart = await Cart.findOneAndDelete({
      _id: req.params.cartId,
      user: req.user._id,
    });

    if (!deletedCart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart item not found" });
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
    const result = await Cart.deleteMany({ user: req.user._id });
    res.json({
      success: true,
      message: "Cart cleared successfully",
      deletedCount: result.deletedCount,
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
