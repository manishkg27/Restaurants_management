const Item = require("../models/Item");
const Restaurant = require("../models/Restaurant");
const { uploadToCloudinary } = require("../utils/cloudinaryUpload");

// @desc    Add new menu item
// @route   POST /api/items/:restaurantId
// @access  Private (Owner)
const createItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (
      !restaurant ||
      restaurant.owner.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to add items to this restaurant",
        });
    }

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
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all items (Global menu)
// @route   GET /api/items
// @access  Public
const getItems = async (req, res) => {
  try {
    const items = await Item.find().populate("restaurant", "name city").lean();
    res.json({ success: true, data: items });
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
      page = 1,
      limit = 20,
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const matchStage = {};
    if (itemName) matchStage.name = { $regex: itemName, $options: "i" };
    if (restaurantName)
      matchStage["restaurantInfo.name"] = {
        $regex: restaurantName,
        $options: "i",
      };
    if (location) {
      matchStage.$or = [
        { "restaurantInfo.location": { $regex: location, $options: "i" } },
        { "restaurantInfo.city": { $regex: location, $options: "i" } },
      ];
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
          averageRating: 1,
          totalRatings: 1,
          "restaurantInfo.name": 1,
          "restaurantInfo.city": 1,
          "restaurantInfo._id": 1,
        },
      },
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

    const restaurant = await Restaurant.findById(item.restaurant);
    if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this item" });
    }

    let imageUrl = item.image;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, "eatify/items");
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.itemId,
      { ...req.body, image: imageUrl },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: updatedItem, message: "Item updated successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/items/:itemId
// @access  Private (Owner)
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    const restaurant = await Restaurant.findById(item.restaurant);
    if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this item" });
    }

    await item.deleteOne();
    res.json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createItem, getItems, searchItems, updateItem, deleteItem };
