const Manager = require("../models/Manager");
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

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

    // Check if the email is already in use by another User
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    // Create a new User account for the manager
    const randomPassword = crypto.randomBytes(20).toString("hex");
    const baseUsername = req.body.name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 10000);
    
    user = await User.create({
      username: baseUsername,
      email: req.body.email,
      password: randomPassword,
      role: "manager",
      isEmailVerified: true, // Auto-verified since the owner created it
    });

    const manager = await Manager.create({
      ...req.body,
      restaurant: restaurant._id,
      user: user._id,
    });

    // Generate setup password token
    const setupToken = user.getResetPasswordToken();
    user.resetPasswordExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save({ validateBeforeSave: false });

    // Send setup email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const setupUrl = `${frontendUrl}/setup-password/${setupToken}`;

    const message = `You have been registered as the Manager for ${restaurant.name}.\n\nPlease click on the following link to set up your password and access your account:\n\n${setupUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Setup your Manager Account",
        message,
      });
    } catch (error) {
      console.error("Failed to send setup email:", error);
      // We don't fail the whole request, but we could notify the owner
    }

    res
      .status(201)
      .json({
        success: true,
        data: manager,
        message: "Manager details added successfully. An email has been sent to the manager to set up their password.",
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
      { returnDocument: 'after', runValidators: true },
    );

    if (!manager)
      return res
        .status(404)
        .json({ success: false, message: "Manager not found or unauthorized" });

    // Sync email to user account if it was updated
    if (req.body.email && manager.user) {
      await User.findByIdAndUpdate(manager.user, { email: req.body.email });
    }

    res.json({
      success: true,
      data: manager,
      message: "Manager details updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createManager, getMyManager, updateManager };
