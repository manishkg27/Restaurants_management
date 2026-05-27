const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getRestaurantOrders,
  updateDeliveryStatus,
  getDashboardStats,
  cancelOrder,
  payOrder,
  getTransactions,
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

// All order routes require authentication
router.use(protect);

// Customer Routes
router.post("/", placeOrder);
router.get("/my-orders", getMyOrders);
router.delete("/:orderId", cancelOrder);
router.patch("/:orderId/pay", payOrder);


// Manager/Owner Routes
router.get('/dashboard-stats', getDashboardStats); 
router.get("/transactions", getTransactions);
router.get("/restaurant-orders", getRestaurantOrders);
router.patch("/:orderId/delivery", updateDeliveryStatus);

module.exports = router;
