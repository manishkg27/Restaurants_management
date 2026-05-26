const Manager = require("../models/Manager");
const Restaurant = require("../models/Restaurant");

// @desc    Add manager details for a restaurant
// @route   POST /api/managers
// @access  Private (Owner)
const createManager = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res
        .status(404)
        .json({
          success: false,
          message: "You must register a restaurant first",
        });
    }

    const existingManager = await Manager.findOne({
      restaurant: restaurant._id,
    });
    if (existingManager) {
      return res
        .status(409)
        .json({
          success: false,
          message: "Manager details already exist for this restaurant",
        });
    }

    const manager = await Manager.create({
      ...req.body,
      restaurant: restaurant._id,
    });

    res
      .status(201)
      .json({
        success: true,
        data: manager,
        message: "Manager details added successfully",
      });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get manager details for the owner's restaurant
// @route   GET /api/managers/my-restaurant
// @access  Private (Owner)
const getMyManager = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant)
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });

    const manager = await Manager.findOne({ restaurant: restaurant._id });
    if (!manager)
      return res
        .status(404)
        .json({ success: false, message: "Manager details not found" });

    res.json({ success: true, data: manager });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update manager details
// @route   PUT /api/managers/:managerId
// @access  Private (Owner)
const updateManager = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant)
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });

    const manager = await Manager.findOneAndUpdate(
      { _id: req.params.managerId, restaurant: restaurant._id },
      req.body,
      { new: true, runValidators: true },
    );

    if (!manager)
      return res
        .status(404)
        .json({ success: false, message: "Manager not found or unauthorized" });

    res.json({
      success: true,
      data: manager,
      message: "Manager details updated successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { createManager, getMyManager, updateManager };
