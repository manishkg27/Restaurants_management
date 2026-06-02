const User = require("../models/User");
const AppError = require("../utils/AppError");
const { asyncHandler } = require("../middleware/errorHandler");

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // If a profile object is passed, merge it with existing
    if (req.body.profile) {
      if (req.body.profile.fullName) user.profile.fullName = req.body.profile.fullName;
      if (req.body.profile.phone) user.profile.contactNumber = req.body.profile.phone;
      if (req.body.profile.contactNumber) user.profile.contactNumber = req.body.profile.contactNumber;
      if (req.body.profile.avatar !== undefined) user.profile.avatar = req.body.profile.avatar;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: updatedUser,
      message: "Profile updated successfully",
    });
  } else {
    throw new AppError("User not found", 404);
  }
});

// @desc    Add a new address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const newAddress = req.body;
  user.profile.addresses.push(newAddress);
  await user.save();

  res.json({ success: true, data: user.profile.addresses, message: "Address added successfully" });
});

// @desc    Update an existing address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const address = user.profile.addresses.id(req.params.addressId);
  if (!address) {
    throw new AppError("Address not found", 404);
  }

  // Update fields
  Object.assign(address, req.body);
  await user.save();

  res.json({ success: true, data: user.profile.addresses, message: "Address updated successfully" });
});

// @desc    Delete an address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.profile.addresses = user.profile.addresses.filter(
    (addr) => addr._id.toString() !== req.params.addressId
  );
  await user.save();

  res.json({ success: true, data: user.profile.addresses, message: "Address deleted successfully" });
});

module.exports = { updateProfile, addAddress, updateAddress, deleteAddress };
