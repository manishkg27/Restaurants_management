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
        user.profile = { ...user.profile, ...req.body.profile };
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
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { updateProfile };
