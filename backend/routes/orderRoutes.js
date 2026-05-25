const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getRestaurantOrders,
  updateDeliveryStatus,
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

// All order routes require authentication
router.use(protect);

// Customer Routes
router.post("/", placeOrder);
router.get("/my-orders", getMyOrders);

// Manager/Owner Routes
router.get("/restaurant-orders", getRestaurantOrders);
router.patch("/:orderId/delivery", updateDeliveryStatus);

module.exports = router;
