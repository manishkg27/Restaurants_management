const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getProfile,
  logoutUser,
  verifyAndSetupManager,
} = require("../../controllers/authController");
const { protect } = require("../../middleware/authMiddleware");
const validate = require("../../middleware/validate");
const {
  registerSchema,
  loginSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  setupManagerSchema,
} = require("../../validators/authValidator");

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", validate(resendVerificationSchema), resendVerification);
router.put("/setup-manager/:token", validate(setupManagerSchema), verifyAndSetupManager);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.put("/reset-password/:token", validate(resetPasswordSchema), resetPassword);
router.post("/logout", protect, logoutUser);
router.get("/profile", protect, getProfile);

module.exports = router;
