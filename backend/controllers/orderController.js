const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Cart = require("../models/Cart");
const Item = require("../models/Item");
const Restaurant = require("../models/Restaurant");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");

// @desc    Place order from cart items
// @route   POST /api/orders
// @access  Private
const placeOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { deliveryInfo, expectedTotal } = req.body;
    const userId = req.user._id;

    if (
      !deliveryInfo ||
      !deliveryInfo.name ||
      !deliveryInfo.phone ||
      !deliveryInfo.address
    ) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: "Incomplete delivery information" });
    }

    // 1. Fetch user's cart
    const cartItems = await Cart.find({ user: userId }).session(session);
    if (cartItems.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const restaurantId = cartItems[0].restaurant;
    let orderTotalPrice = 0;
    const orderItemsData = [];

    // 2. Fetch fresh items and calculate secure totals
    for (const cartItem of cartItems) {
      const dbItem = await Item.findById(cartItem.item).session(session);

      if (!dbItem) {
        throw new Error(`Item ${cartItem.item} no longer exists`);
      }

      const itemTotalPrice = dbItem.price * cartItem.quantity;
      orderTotalPrice += itemTotalPrice;

      orderItemsData.push({
        item: dbItem._id,
        itemName: dbItem.name,
        itemPrice: dbItem.price,
        quantity: cartItem.quantity,
        totalPrice: itemTotalPrice,
      });
    }

    if (expectedTotal && Math.abs(orderTotalPrice - expectedTotal) > 0.01) {
      throw new Error(`Prices have been updated! The new total is ₹${orderTotalPrice}. Please review your cart to continue.`);
    }

    // 3. Create the Order
    const [order] = await Order.create(
      [
        {
          user: userId,
          restaurant: restaurantId,
          deliveryInfo,
          totalPrice: orderTotalPrice,
          paymentStatus: false, // Wait for Razorpay verification in Phase 6
          deliveryStatus: "pending",
        },
      ],
      { session },
    );

    // 4. Attach order ID to items and bulk insert
    const populatedOrderItems = orderItemsData.map((item) => ({
      ...item,
      order: order._id,
    }));
    await OrderItem.insertMany(populatedOrderItems, { session });

    // Cart is preserved here and will be cleared only upon successful payment verification.
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      data: {
        orderId: order._id,
        totalPrice: order.totalPrice,
        restaurant: order.restaurant,
        itemCount: orderItemsData.length,
      },
      message: "Order placed successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's orders (Categorized)
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const statusFilter = req.query.status; // 'current', 'payment-pending', 'delivered'
    let matchStage = { user: new mongoose.Types.ObjectId(req.user._id) };

    if (statusFilter === "payment-pending") {
      matchStage.paymentStatus = false;
      matchStage.deliveryStatus = { $ne: "cancelled" };
    } else if (statusFilter === "delivered") {
      matchStage.$or = [
        { paymentStatus: true, deliveryStatus: "delivered" },
        { deliveryStatus: "cancelled" }
      ];
    } else if (statusFilter === "current") {
      matchStage.paymentStatus = true;
      matchStage.deliveryStatus = { $nin: ["delivered", "cancelled"] };
    }

    // Use aggregation to fetch orders + their items + restaurant name
    const orders = await Order.aggregate([
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "orderitems",
          localField: "_id",
          foreignField: "order",
          as: "items",
        },
      },
      {
        $lookup: {
          from: "restaurants",
          localField: "restaurant",
          foreignField: "_id",
          as: "restaurantInfo",
        },
      },
      { $unwind: "$restaurantInfo" },
      {
        $project: {
          totalPrice: 1,
          paymentStatus: 1,
          deliveryStatus: 1,
          createdAt: 1,
          deliveryInfo: 1,
          "restaurant.name": "$restaurantInfo.name",
          items: { _id: 1, item: 1, itemName: 1, quantity: 1, totalPrice: 1 },
        },
      },
    ]);

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders for the owner's restaurant
// @route   GET /api/orders/restaurant-orders
// @access  Private (Owner)
const getRestaurantOrders = async (req, res) => {
  try {
    // 1. Find the owner's restaurant
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    // 2. Fetch orders + items
    const orders = await Order.aggregate([
      { $match: { restaurant: restaurant._id, paymentStatus: true } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "orderitems",
          localField: "_id",
          foreignField: "order",
          as: "items",
        },
      },
      {
        $addFields: {
          orderStatus: {
            $cond: {
              if: { $eq: ["$paymentStatus", false] },
              then: "Payment Left",
              else: {
                $cond: {
                  if: { $eq: ["$deliveryStatus", "delivered"] },
                  then: "Delivered",
                  else: "Pending",
                },
              },
            },
          },
        },
      },
      {
        $project: {
          "deliveryInfo.name": 1,
          "deliveryInfo.phone": 1,
          "deliveryInfo.address": 1,
          totalPrice: 1,
          orderStatus: 1,
          paymentStatus: 1,
          deliveryStatus: 1,
          createdAt: 1,
          items: { itemName: 1, quantity: 1, totalPrice: 1 },
        },
      },
    ]);

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update delivery status
// @route   PATCH /api/orders/:orderId/delivery
// @access  Private (Owner)
const updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryStatus } = req.body;

    // Ensure the user actually owns the restaurant this order belongs to
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant)
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });

    const order = await Order.findOne({ _id: req.params.orderId, restaurant: restaurant._id });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found or unauthorized" });
    }

    const VALID_TRANSITIONS = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['out-for-delivery', 'cancelled'],
      'out-for-delivery': ['delivered'],
      delivered: [],
      cancelled: [],
    };

    if (!VALID_TRANSITIONS[order.deliveryStatus]?.includes(deliveryStatus)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status transition from ${order.deliveryStatus} to ${deliveryStatus}` 
      });
    }

    order.deliveryStatus = deliveryStatus;
    await order.save();

    if (deliveryStatus === 'cancelled') {
      await OrderItem.deleteMany({ order: order._id });
    }

    // Future: Emit socket to user to notify them of delivery status change
    const io = req.app.get("io");
    if (io) {
      let customMessage = `Your order status is now: ${deliveryStatus}`;
      if (deliveryStatus === "cancelled") {
        customMessage = "Your order was cancelled due to unforeseen issues. Your money will be credited back to your account within 2-3 working days.";
      }
      
      // Save notification to DB
      await Notification.create({
        recipient: order.user,
        type: "order_update",
        message: customMessage,
        relatedOrder: order._id,
      });

      io.to(`user_${order.user}`).emit("orderStatusUpdate", {
          orderId: order._id,
          deliveryStatus: order.deliveryStatus,
          updatedAt: order.updatedAt,
          message: customMessage,
      });
    }
    res.json({
      success: true,
      data: order,
      message: `Delivery status updated to ${deliveryStatus}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get transactions (paid orders) for owner dashboard
// @route   GET /api/orders/transactions
// @access  Private (Owner)
const getTransactions = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const { search, startDate, endDate } = req.query;

    let matchStage = {
      restaurant: restaurant._id,
      paymentStatus: true
    };

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) {
        matchStage.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchStage.createdAt.$lte = end;
      }
    }

    if (search) {
      matchStage.$or = [
        { "deliveryInfo.name": { $regex: search, $options: "i" } },
        { $expr: { $regexMatch: { input: { $toString: "$_id" }, regex: search, options: "i" } } }
      ];
    }

    const transactions = await Order.aggregate([
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
      { $limit: 50 },
      {
        $project: {
          _id: 1,
          "deliveryInfo.name": 1,
          totalPrice: 1,
          createdAt: 1,
          deliveryStatus: 1,
        }
      }
    ]);

    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get aggregated statistics for manager dashboard
// @route   GET /api/orders/dashboard-stats
// @access  Private (Owner)
const getDashboardStats = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const stats = await Order.aggregate([
      // Stage 1: Match orders for this specific restaurant
      { $match: { restaurant: restaurant._id } },
      
      // Stage 2: Group everything together (_id: null) and calculate metrics
      { $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          
          // Revenue: Only sum totalPrice IF paymentStatus is true and deliveryStatus is not cancelled
          totalRevenue: { 
            $sum: { 
              $cond: [
                { $and: [
                  { $eq: ["$paymentStatus", true] },
                  { $ne: ["$deliveryStatus", "cancelled"] }
                ]},
                "$totalPrice", 
                0
              ] 
            }
          },
          
          // Pending Orders: Payment is true and delivery is NOT "delivered" and NOT "cancelled"
          pendingOrders: {
            $sum: { 
              $cond: [
                { $and: [
                  { $eq: ["$paymentStatus", true] },
                  { $ne: ["$deliveryStatus", "delivered"] },
                  { $ne: ["$deliveryStatus", "cancelled"] }
                ]},
                1, 
                0
              ] 
            }
          },
          
          // Delivered Orders
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ["$deliveryStatus", "delivered"] }, 1, 0] }
          },
          
          // Cancelled Orders
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ["$deliveryStatus", "cancelled"] }, 1, 0] }
          }
      }},
      
      // Stage 3: Clean up the output format
      { $project: {
          _id: 0,
          totalOrders: 1,
          totalRevenue: 1,
          pendingOrders: 1,
          deliveredOrders: 1,
          cancelledOrders: 1
      }}
    ]);

    // Handle case where restaurant has no orders yet
    const defaultStats = { totalOrders: 0, totalRevenue: 0, pendingOrders: 0, deliveredOrders: 0, cancelledOrders: 0 };

    res.json({ 
      success: true, 
      data: stats.length > 0 ? stats[0] : defaultStats 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel an unpaid order
// @route   DELETE /api/orders/:orderId
// @access  Private (Customer)
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    
    if (order.paymentStatus === true) {
      return res.status(400).json({ success: false, message: "Cannot cancel a paid order" });
    }

    order.deliveryStatus = "cancelled";
    await order.save();

    await OrderItem.deleteMany({ order: order._id });

    res.json({ success: true, message: "Order cancelled successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



module.exports = {
  placeOrder,
  getMyOrders,
  getRestaurantOrders,
  updateDeliveryStatus,
  getTransactions,
  getDashboardStats,
  cancelOrder,
};
