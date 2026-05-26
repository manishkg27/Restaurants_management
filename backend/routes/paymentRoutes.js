const express = require("express");
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPayment,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

// All payment routes require authentication
router.use(protect);

router.post("/checkout/:orderId", createRazorpayOrder);
router.post("/verify", verifyPayment);

module.exports = router;
