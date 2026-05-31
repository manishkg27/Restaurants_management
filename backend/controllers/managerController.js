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
      return res.status(404).json({
        success: false,
        message: "You must register a restaurant first",
      });
    }

    const existingManager = await Manager.findOne({
      restaurant: restaurant._id,
    });
    if (existingManager) {
      return res.status(409).json({
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

    // Create a new User account for the manager (unverified, random password)
    const randomPassword = crypto.randomBytes(20).toString("hex");
    const baseUsername =
      req.body.name.toLowerCase().replace(/\s+/g, "") +
      Math.floor(Math.random() * 10000);

    user = await User.create({
      username: baseUsername,
      email: req.body.email,
      password: randomPassword,
      role: "manager",
      isEmailVerified: false, // Manager must verify via the link
    });

    const manager = await Manager.create({
      ...req.body,
      restaurant: restaurant._id,
      user: user._id,
    });

    // Generate email verification token (used for combined verify + setup password)
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send combined verify + setup-password link
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const setupUrl = `${frontendUrl}/setup-manager/${verificationToken}`;

    const message = `You have been registered as the Manager for ${restaurant.name}.\n\nPlease click on the following link to verify your email and set up your password:\n\n${setupUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Verify & Setup your Manager Account",
        message,
      });
    } catch (error) {
      console.error("Failed to send setup email:", error);
    }

    res.status(201).json({
      success: true,
      data: manager,
      message:
        "Manager details added successfully. A verification & setup link has been sent to the manager's email.",
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

    // Get the existing manager to check for email change
    const existingManager = await Manager.findOne({
      _id: req.params.managerId,
      restaurant: restaurant._id,
    });

    if (!existingManager)
      return res
        .status(404)
        .json({ success: false, message: "Manager not found or unauthorized" });


    const manager = await Manager.findOneAndUpdate(
      { _id: req.params.managerId, restaurant: restaurant._id },
      req.body,
      { returnDocument: "after", runValidators: true },
    );

    let userToUpdate = null;
    let needsVerificationLink = false;
    let emailChanged = false; // We calculate this differently now

    // Check if a user account is linked
    if (!manager.user) {
      // Old manager profile without a user account. We must create one now.
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        // We can't create it because the email is taken
        return res.status(409).json({
          success: false,
          message: "A user with this email already exists.",
        });
      }

      const randomPassword = crypto.randomBytes(20).toString("hex");
      const baseUsername =
        req.body.name.toLowerCase().replace(/\s+/g, "") +
        Math.floor(Math.random() * 10000);

      userToUpdate = await User.create({
        username: baseUsername,
        email: req.body.email,
        password: randomPassword,
        role: "manager",
        isEmailVerified: false,
      });

      // Link it to the manager
      manager.user = userToUpdate._id;
      await manager.save();

      needsVerificationLink = true;
      emailChanged = true; // Act like email changed so the message makes sense
    } else {
      // User account exists, proceed with normal update logic
      userToUpdate = await User.findById(manager.user);
      emailChanged = req.body.email && req.body.email !== existingManager.email;

      if (userToUpdate) {
        if (emailChanged) {
          const existingUser = await User.findOne({
            email: req.body.email,
            _id: { $ne: userToUpdate._id },
          });
          if (existingUser) {
            await Manager.findByIdAndUpdate(manager._id, {
              email: existingManager.email,
            });
            return res.status(409).json({
              success: false,
              message: "A user with this email already exists.",
            });
          }
          userToUpdate.email = req.body.email;
          userToUpdate.isEmailVerified = false;
          needsVerificationLink = true;
        } else if (!userToUpdate.isEmailVerified) {
          needsVerificationLink = true;
        }
      }
    }

    if (needsVerificationLink && userToUpdate) {
      const verificationToken = userToUpdate.getEmailVerificationToken();

      if (emailChanged) {
        userToUpdate.password = crypto.randomBytes(20).toString("hex");
      }
      await userToUpdate.save();

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const setupUrl = `${frontendUrl}/setup-manager/${verificationToken}`;

      const message = emailChanged
        ? `Your manager email for ${restaurant.name} has been updated.\n\nPlease click on the following link to verify your new email and set up your password:\n\n${setupUrl}`
        : `You have been registered as the Manager for ${restaurant.name}.\n\nPlease click on the following link to verify your email and set up your password:\n\n${setupUrl}`;

      try {
        await sendEmail({
          email: req.body.email || existingManager.email,
          subject: "Verify & Setup your Manager Account",
          message,
        });
      } catch (error) {
        console.error("Failed to send setup email:", error);
      }
    }

    res.json({
      success: true,
      data: manager,
      message: needsVerificationLink
        ? "Manager details updated. A verification & setup link has been sent to the manager's email."
        : "Manager details updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createManager, getMyManager, updateManager };
