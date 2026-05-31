const Restaurant = require("../models/Restaurant");
const Item = require("../models/Item");
const Manager = require("../models/Manager");
const { uploadToCloudinary } = require("../utils/cloudinaryUpload");

// @desc    Register new restaurant
// @route   POST /api/restaurants
// @access  Private (Owner only)
const createRestaurant = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Only owners can register restaurants",
        });
    }

    const existing = await Restaurant.findOne({ owner: req.user._id });
    if (existing) {
      return res
        .status(409)
        .json({
          success: false,
          message: "You already have a registered restaurant",
        });
    }

    let restaurantImageUrl = "";

    if (req.files) {
      if (req.files.restaurantImage)
        restaurantImageUrl = await uploadToCloudinary(
          req.files.restaurantImage[0].buffer,
          "eatify/restaurants",
        );
    }

    const { name, location, city, state, country, pinCode, restaurantContact, ownerContact, ownerName, ownerEmail, openTime, closeTime } = req.body;
    const restaurant = await Restaurant.create({
      name, location, city, state, country, pinCode, restaurantContact, ownerContact, ownerName, ownerEmail, openTime, closeTime,
      owner: req.user._id,
      restaurantImage: restaurantImageUrl,
    });

    res
      .status(201)
      .json({
        success: true,
        data: restaurant,
        message: "Restaurant registered successfully",
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
const getRestaurants = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const query = { status: { $ne: "deleted" } };
    if (req.query.search) {
      query.name = { $regex: escapeRegex(req.query.search), $options: "i" };
    }
    if (req.query.city) {
      query.city = { $regex: escapeRegex(req.query.city), $options: "i" };
    }

    const restaurants = await Restaurant.find(query).skip(skip).limit(limit).lean();
    const total = await Restaurant.countDocuments(query);

    res.json({
      success: true,
      data: restaurants,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged-in owner's restaurant
// @route   GET /api/restaurants/mine
// @access  Private (Owner)
const getMyRestaurant = async (req, res) => {
  try {
    let restaurant;
    if (req.user.role === 'owner') {
      restaurant = await Restaurant.findOne({ owner: req.user._id, status: { $ne: "deleted" } }).lean();
    } else if (req.user.role === 'manager') {
      const managerProfile = await Manager.findOne({ user: req.user._id });
      if (managerProfile) {
        restaurant = await Restaurant.findOne({ _id: managerProfile.restaurant, status: { $ne: "deleted" } }).lean();
      }
    }

    if (!restaurant)
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });

    const menuItems = await Item.find({ restaurant: restaurant._id }).lean();
    restaurant.menuItems = menuItems;

    res.json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single restaurant by ID
// @route   GET /api/restaurants/:id
// @access  Public
const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ _id: req.params.id, status: { $ne: "deleted" } }).lean();
    if (!restaurant)
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });

    const menuItems = await Item.find({ restaurant: restaurant._id }).lean();
    restaurant.menuItems = menuItems;

    res.json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update restaurant details
// @route   PUT /api/restaurants/:id
// @access  Private (Owner, Manager)
const updateRestaurant = async (req, res) => {
  try {
    let restaurant = await Restaurant.findOne({ _id: req.params.id, status: { $ne: "deleted" } });
    if (!restaurant)
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });

    let isAuthorized = false;
    if (req.user.role === 'owner' && restaurant.owner.toString() === req.user._id.toString()) {
      isAuthorized = true;
    } else if (req.user.role === 'manager') {
      const managerProfile = await Manager.findOne({ user: req.user._id, restaurant: restaurant._id });
      if (managerProfile) isAuthorized = true;
    }

    if (!isAuthorized) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to update this restaurant",
        });
    }

    const { name, location, city, state, country, pinCode, restaurantContact, ownerContact, ownerName, ownerEmail, openTime, closeTime } = req.body;
    const updateData = { name, location, city, state, country, pinCode, restaurantContact, ownerContact, ownerName, ownerEmail, openTime, closeTime };
    
    // Remove undefined fields to avoid unintentionally unsetting values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    if (req.files) {
      if (req.files.restaurantImage)
        updateData.restaurantImage = await uploadToCloudinary(
          req.files.restaurantImage[0].buffer,
          "eatify/restaurants",
        );
    }

    restaurant = await Restaurant.findByIdAndUpdate(req.params.id, updateData, {
      returnDocument: 'after',
      runValidators: true,
    });
    res.json({
      success: true,
      data: restaurant,
      message: "Updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete restaurant (soft delete)
// @route   DELETE /api/restaurants/:id
// @access  Private (Owner)
const deleteRestaurant = async (req, res) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant)
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });

    if (restaurant.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to delete this restaurant",
        });
    }

    restaurant.status = "deleted";
    await restaurant.save();

    // Delete associated manager profile and their user account
    const Manager = require("../models/Manager");
    const User = require("../models/User");
    const managers = await Manager.find({ restaurant: restaurant._id });
    for (const mgr of managers) {
      if (mgr.user) await User.findByIdAndDelete(mgr.user);
      await mgr.deleteOne();
    }

    res.json({
      success: true,
      message: "Restaurant deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createRestaurant,
  getRestaurants,
  getMyRestaurant,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
};
