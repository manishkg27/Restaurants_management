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
} = require("../../controllers/orderController");
const { protect, authorizeRole } = require("../../middleware/authMiddleware");
const validate = require("../../middleware/validate");
const { placeOrderSchema, updateDeliveryStatusSchema } = require("../../validators/orderValidator");

// All order routes require authentication
router.use(protect);

// Customer Routes
router.post("/", validate(placeOrderSchema), placeOrder);
router.get("/my-orders", getMyOrders);
router.patch("/:orderId/cancel", cancelOrder);


// Manager/Owner Routes
router.get('/dashboard-stats', authorizeRole('owner', 'manager'), getDashboardStats); 
router.get("/transactions", authorizeRole('owner', 'manager'), getTransactions);
router.get("/restaurant-orders", authorizeRole('owner', 'manager'), getRestaurantOrders);
router.patch("/:orderId/delivery", authorizeRole('owner', 'manager'), validate(updateDeliveryStatusSchema), updateDeliveryStatus);

module.exports = router;
