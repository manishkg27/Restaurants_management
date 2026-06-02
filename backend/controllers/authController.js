const crypto = require("crypto");
const User = require("../models/User");
const Manager = require("../models/Manager");
const Restaurant = require("../models/Restaurant");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");
const AppError = require("../utils/AppError");
const { asyncHandler } = require("../middleware/errorHandler");

const setTokenCookie = (res, token) => {
  res.cookie("eatify_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) {
    throw new AppError("User already exists", 409);
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password,
    role: role || "customer",
  });

  if (!user) {
    throw new AppError("Invalid user data", 400);
  }

  // Generate email verification token
  const verificationToken = user.getEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Create verification url
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;

  const message = `You are receiving this email because you (or someone else) have requested the registration of an account. Please click on the following link to verify your email address:\n\n${verificationUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Email Verification",
      message,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful. Please check your email to verify your account.",
    });
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    throw new AppError("Email could not be sent", 500);
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and explicitly select the password field
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isEmailVerified) {
    // Auto-send verification link when unverified user tries to login
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;

    const message = `Please click on the following link to verify your email address:\n\n${verificationUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Email Verification",
        message,
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError.message);
    }

    throw new AppError("Please verify your email address to login. A verification link has been sent.", 401);
  }

  if (user.role === "manager") {
    const managerProfile = await Manager.findOne({ user: user._id });
    if (managerProfile) {
      const restaurant = await Restaurant.findById(managerProfile.restaurant);
      if (restaurant && restaurant.status === "deleted") {
        throw new AppError("This restaurant is no longer active.", 401);
      }
    }
  }

  setTokenCookie(res, generateToken(user._id));
  res.json({
    success: true,
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profile: user.profile,
    },
    message: "Login successful",
  });
});

// @desc    Verify user email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  // Get hashed token
  const emailVerificationToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Invalid or expired token", 400);
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Email verified successfully. You can now login.",
  });
});

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    throw new AppError("There is no user with that email", 404);
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Create reset url
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please click on the following link to complete the process:\n\n${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Token",
      message,
    });

    res.status(200).json({ success: true, message: "Email sent" });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });

    throw new AppError("Email could not be sent", 500);
  }
});

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Invalid or expired token", 400);
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  // Automatically verify email since they proved ownership to reset password
  if (!user.isEmailVerified) {
    user.isEmailVerified = true;
  }

  await user.save(); // password hashing happens here because of pre('save') hook

  res.status(200).json({
    success: true,
    message: "Password reset successfully. You can now login.",
  });
});

// @desc    Resend Verification Email
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isEmailVerified) {
    throw new AppError("Email is already verified", 400);
  }

  // Generate new token
  const verificationToken = user.getEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Create verification url
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;

  const message = `Please click on the following link to verify your email address:\n\n${verificationUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Email Verification",
      message,
    });

    res.status(200).json({
      success: true,
      message: "Verification email resent successfully",
    });
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    throw new AppError("Email could not be sent", 500);
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      success: true,
      data: user,
    });
  } else {
    throw new AppError("User not found", 404);
  }
});

// @desc    Logout user (stateless)
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("eatify_token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.json({ success: true, message: "Logout successful" });
});

// @desc    Verify manager email & set password (combined flow)
// @route   PUT /api/auth/setup-manager/:token
// @access  Public
const verifyAndSetupManager = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password || password.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }

  // Hash the token from params to match the stored hashed token
  const emailVerificationToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Invalid or expired token. Please ask the restaurant owner to resend the setup link.", 400);
  }

  // Verify email + set password + clear token
  user.isEmailVerified = true;
  user.password = password;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;

  await user.save(); // password hashing happens in pre('save') hook

  res.status(200).json({
    success: true,
    message: "Account verified and password set successfully. You can now login.",
  });
});

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getProfile,
  logoutUser,
  verifyAndSetupManager,
};
