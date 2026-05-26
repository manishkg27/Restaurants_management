const Restaurant = require("../models/Restaurant");
const Item = require("../models/Item");
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

    let menuImageUrl = "",
      restaurantImageUrl = "";

    if (req.files) {
      if (req.files.menuImage)
        menuImageUrl = await uploadToCloudinary(
          req.files.menuImage[0].buffer,
          "eatify/restaurants",
        );
      if (req.files.restaurantImage)
        restaurantImageUrl = await uploadToCloudinary(
          req.files.restaurantImage[0].buffer,
          "eatify/restaurants",
        );
    }

    const restaurant = await Restaurant.create({
      ...req.body,
      owner: req.user._id,
      menuImage: menuImageUrl,
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
    res.status(400).json({ success: false, message: error.message });
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

    const restaurants = await Restaurant.find().skip(skip).limit(limit).lean();
    const total = await Restaurant.countDocuments();

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
    const restaurant = await Restaurant.findOne({ owner: req.user._id }).lean();
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
    const restaurant = await Restaurant.findById(req.params.id).lean();
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
// @access  Private (Owner)
const updateRestaurant = async (req, res) => {
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
          message: "Not authorized to update this restaurant",
        });
    }

    if (req.files) {
      if (req.files.menuImage)
        req.body.menuImage = await uploadToCloudinary(
          req.files.menuImage[0].buffer,
          "eatify/restaurants",
        );
      if (req.files.restaurantImage)
        req.body.restaurantImage = await uploadToCloudinary(
          req.files.restaurantImage[0].buffer,
          "eatify/restaurants",
        );
    }

    restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json({
      success: true,
      data: restaurant,
      message: "Updated successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createRestaurant,
  getRestaurants,
  getMyRestaurant,
  getRestaurantById,
  updateRestaurant,
};
