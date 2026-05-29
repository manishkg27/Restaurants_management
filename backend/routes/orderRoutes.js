const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getRestaurantOrders,
  updateDeliveryStatus,
  getDashboardStats,
  cancelOrder,
  getTransactions,
} = require("../controllers/orderController");
const { protect, authorizeRole } = require("../middleware/authMiddleware");

// All order routes require authentication
router.use(protect);

// Customer Routes
router.post("/", placeOrder);
router.get("/my-orders", getMyOrders);
router.delete("/:orderId", cancelOrder);


// Manager/Owner Routes
router.get('/dashboard-stats', authorizeRole('owner'), getDashboardStats); 
router.get("/transactions", authorizeRole('owner'), getTransactions);
router.get("/restaurant-orders", authorizeRole('owner'), getRestaurantOrders);
router.patch("/:orderId/delivery", authorizeRole('owner'), updateDeliveryStatus);

module.exports = router;
