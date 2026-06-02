const Manager = require("../models/Manager");
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const AppError = require("../utils/AppError");
const { asyncHandler } = require("../middleware/errorHandler");

// @desc    Add manager details for a restaurant
// @route   POST /api/managers
// @access  Private (Owner)
const createManager = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id });

  if (!restaurant) {
    throw new AppError("You must register a restaurant first", 404);
  }

  const existingManager = await Manager.findOne({
    restaurant: restaurant._id,
  });
  if (existingManager) {
    throw new AppError("Manager details already exist for this restaurant", 409);
  }

  // Check if the email is already in use by another User
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    throw new AppError("A user with this email already exists.", 409);
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

  const { name, contact, email, address, bankName, bankBranch, bankIFSC, bankAccount } = req.body;
  const manager = await Manager.create({
    name,
    contact,
    email,
    address,
    bankName,
    bankBranch,
    bankIFSC,
    bankAccount,
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
});

// @desc    Get manager details for the owner's restaurant
// @route   GET /api/managers/my-restaurant
// @access  Private (Owner)
const getMyManager = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id });
  if (!restaurant) {
    throw new AppError("Restaurant not found", 404);
  }

  const manager = await Manager.findOne({ restaurant: restaurant._id });
  if (!manager) {
    throw new AppError("Manager details not found", 404);
  }

  res.json({ success: true, data: manager });
});

// @desc    Update manager details
// @route   PUT /api/managers/:managerId
// @access  Private (Owner)
const updateManager = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id });
  if (!restaurant) {
    throw new AppError("Restaurant not found", 404);
  }

  // Get the existing manager to check for email change
  const existingManager = await Manager.findOne({
    _id: req.params.managerId,
    restaurant: restaurant._id,
  });

  if (!existingManager) {
    throw new AppError("Manager not found or unauthorized", 404);
  }

  const { name, contact, email, address, bankName, bankBranch, bankIFSC, bankAccount } = req.body;
  const manager = await Manager.findOneAndUpdate(
    { _id: req.params.managerId, restaurant: restaurant._id },
    { name, contact, email, address, bankName, bankBranch, bankIFSC, bankAccount },
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
      throw new AppError("A user with this email already exists.", 409);
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
          throw new AppError("A user with this email already exists.", 409);
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
});

module.exports = { createManager, getMyManager, updateManager };
