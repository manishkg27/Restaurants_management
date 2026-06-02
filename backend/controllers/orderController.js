const orderService = require("../services/orderService");
const { asyncHandler } = require("../middleware/errorHandler");

const placeOrder = asyncHandler(async (req, res) => {
  const { deliveryInfo, expectedTotal } = req.body;
  const data = await orderService.placeOrder(req.user._id, deliveryInfo, expectedTotal);
  res.status(201).json({ success: true, data, message: "Order placed successfully" });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const data = await orderService.getMyOrders(req.user._id, req.query.status, page, limit);
  res.json({ success: true, data, page, limit });
});

const getRestaurantOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const data = await orderService.getRestaurantOrders(req.user, page, limit);
  res.json({ success: true, data, page, limit });
});

const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const io = req.app.get("io");
  const data = await orderService.updateDeliveryStatus(req.user, req.params.orderId, req.body.status, io);
  res.json({ success: true, data, message: `Delivery status updated to ${req.body.status}` });
});

const getTransactions = asyncHandler(async (req, res) => {
  const { search, startDate, endDate } = req.query;
  const data = await orderService.getTransactions(req.user, search, startDate, endDate);
  res.json({ success: true, data });
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const data = await orderService.getDashboardStats(req.user);
  res.json({ success: true, data });
});

const cancelOrder = asyncHandler(async (req, res) => {
  await orderService.cancelOrder(req.user._id, req.params.orderId);
  res.json({ success: true, message: "Order cancelled successfully" });
});

module.exports = {
  placeOrder,
  getMyOrders,
  getRestaurantOrders,
  updateDeliveryStatus,
  getTransactions,
  getDashboardStats,
  cancelOrder,
};
