const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Cart = require("../models/Cart");
const Item = require("../models/Item");
const Restaurant = require("../models/Restaurant");
const mongoose = require("mongoose");

// @desc    Place order from cart items
// @route   POST /api/orders
// @access  Private
const placeOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { deliveryInfo } = req.body;
    const userId = req.user._id;

    if (
      !deliveryInfo ||
      !deliveryInfo.name ||
      !deliveryInfo.phone ||
      !deliveryInfo.address
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Incomplete delivery information" });
    }

    // 1. Fetch user's cart
    const cartItems = await Cart.find({ user: userId }).session(session);
    if (cartItems.length === 0) {
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

    // 5. Clear the user's cart
    await Cart.deleteMany({ user: userId }).session(session);

    await session.commitTransaction();
    session.endSession();

    // Socket.io trigger (Placeholder logic for Phase 8)
    const io = req.app.get("io");
    if (io) {
      io.to(`restaurant_${restaurantId}`).emit("newOrder", {
        message: `New Order #${order._id} has been placed!`,
        orderId: order._id,
        totalPrice: orderTotalPrice,
      });
    }

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
    let matchStage = { user: req.user._id };

    if (statusFilter === "payment-pending") {
      matchStage.paymentStatus = false;
    } else if (statusFilter === "delivered") {
      matchStage.paymentStatus = true;
      matchStage.deliveryStatus = "delivered";
    } else if (statusFilter === "current") {
      matchStage.paymentStatus = true;
      matchStage.deliveryStatus = { $ne: "delivered" };
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
          items: { itemName: 1, quantity: 1, totalPrice: 1 },
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
      { $match: { restaurant: restaurant._id } },
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

    const order = await Order.findOneAndUpdate(
      { _id: req.params.orderId, restaurant: restaurant._id },
      { deliveryStatus },
      { new: true, runValidators: true },
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found or unauthorized" });
    }

    // Future: Emit socket to user to notify them of delivery status change

    res.json({
      success: true,
      data: order,
      message: `Delivery status updated to ${deliveryStatus}`,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getRestaurantOrders,
  updateDeliveryStatus,
};
