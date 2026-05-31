const User = require("../models/User");

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
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
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a new address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const newAddress = req.body;
    user.profile.addresses.push(newAddress);
    await user.save();

    res.json({ success: true, data: user.profile.addresses, message: "Address added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an existing address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const address = user.profile.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ success: false, message: "Address not found" });

    // Update fields
    Object.assign(address, req.body);
    await user.save();

    res.json({ success: true, data: user.profile.addresses, message: "Address updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.profile.addresses = user.profile.addresses.filter(
      (addr) => addr._id.toString() !== req.params.addressId
    );
    await user.save();

    res.json({ success: true, data: user.profile.addresses, message: "Address deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { updateProfile, addAddress, updateAddress, deleteAddress };
