const Item = require("../models/Item");
const Restaurant = require("../models/Restaurant");
const Manager = require("../models/Manager");
const { uploadToCloudinary } = require("../utils/cloudinaryUpload");

const isAuthorizedForRestaurant = async (user, restaurantId) => {
  if (user.role === 'owner') {
    const restaurant = await Restaurant.findById(restaurantId);
    return restaurant && restaurant.owner.toString() === user._id.toString();
  } else if (user.role === 'manager') {
    const managerProfile = await Manager.findOne({ user: user._id, restaurant: restaurantId });
    return !!managerProfile;
  }
  return false;
};

// @desc    Add new menu item
// @route   POST /api/items/:restaurantId
// @access  Private (Owner)
const createItem = async (req, res) => {
  try {
    const isAuthorized = await isAuthorizedForRestaurant(req.user, req.params.restaurantId);
    if (!isAuthorized) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to add items to this restaurant",
        });
    }

    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) return res.status(404).json({ success: false, message: "Restaurant not found" });

    let imageUrl = "";
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, "eatify/items");
    }

    const item = await Item.create({
      ...req.body,
      restaurant: restaurant._id,
      image: imageUrl,
    });

    res
      .status(201)
      .json({ success: true, data: item, message: "Item added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all items (Global menu)
// @route   GET /api/items
// @access  Public
const getItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const items = await Item.find()
      .populate("restaurant", "name city")
      .skip(skip)
      .limit(limit)
      .lean();
      
    res.json({ success: true, data: items, page, limit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search/filter items using Aggregation
// @route   GET /api/items/search
// @access  Public
const searchItems = async (req, res) => {
  try {
    const {
      itemName,
      restaurantName,
      location,
      isVegetarian,
      sortBy,
      page = 1,
      limit = 20,
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const matchStage = { "restaurantInfo.status": { $ne: "deleted" } };
    if (itemName) matchStage.name = { $regex: escapeRegex(itemName), $options: "i" };
    if (restaurantName)
      matchStage["restaurantInfo.name"] = {
        $regex: escapeRegex(restaurantName),
        $options: "i",
      };
    if (location) {
      matchStage.$or = [
        { "restaurantInfo.location": { $regex: escapeRegex(location), $options: "i" } },
        { "restaurantInfo.city": { $regex: escapeRegex(location), $options: "i" } },
      ];
    }
    if (isVegetarian === 'true') {
      matchStage.isVegetarian = true;
    }

    let sortStage = {};
    if (sortBy === 'rating') {
      sortStage = { $sort: { averageRating: -1 } };
    } else if (sortBy === 'price_low') {
      sortStage = { $sort: { price: 1 } };
    } else if (sortBy === 'price_high') {
      sortStage = { $sort: { price: -1 } };
    } else {
      sortStage = { $sort: { createdAt: -1 } }; // default
    }

    const pipeline = [
      {
        $lookup: {
          from: "restaurants",
          localField: "restaurant",
          foreignField: "_id",
          as: "restaurantInfo",
        },
      },
      { $unwind: "$restaurantInfo" },
      { $match: matchStage },
      {
        $project: {
          name: 1,
          description: 1,
          price: 1,
          image: 1,
          isVegetarian: 1,
          averageRating: 1,
          totalRatings: 1,
          "restaurantInfo.name": 1,
          "restaurantInfo.city": 1,
          "restaurantInfo._id": 1,
        },
      },
      sortStage,
      { $skip: skip },
      { $limit: parseInt(limit) },
    ];

    const items = await Item.aggregate(pipeline);
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update menu item
// @route   PUT /api/items/:itemId
// @access  Private (Owner)
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    const isAuthorized = await isAuthorizedForRestaurant(req.user, item.restaurant);
    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: "Not authorized to update this item" });
    }

    let imageUrl = item.image;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, "eatify/items");
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.itemId,
      { ...req.body, image: imageUrl },
      { returnDocument: 'after', runValidators: true }
    );

    res.json({ success: true, data: updatedItem, message: "Item updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/items/:itemId
// @access  Private (Owner)
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    const isAuthorized = await isAuthorizedForRestaurant(req.user, item.restaurant);
    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this item" });
    }

    await item.deleteOne();
    res.json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createItem, getItems, searchItems, updateItem, deleteItem };
