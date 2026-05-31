const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Cart = require("../models/Cart");
const Item = require("../models/Item");
const Restaurant = require("../models/Restaurant");
const Manager = require("../models/Manager");
const Notification = require("../models/Notification");
const Feedback = require("../models/Feedback");
const mongoose = require("mongoose");

class OrderService {
  async placeOrder(userId, deliveryInfo, expectedTotal) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const cartItems = await Cart.find({ user: userId }).session(session);
      if (cartItems.length === 0) {
        throw { statusCode: 400, message: "Cart is empty" };
      }

      const restaurantId = cartItems[0].restaurant;
      const restaurant = await Restaurant.findById(restaurantId).session(session);
      if (!restaurant || restaurant.status === "deleted") {
        throw { statusCode: 400, message: "This restaurant is no longer active and cannot accept orders" };
      }
      
      let orderTotalPrice = 0;
      const orderItemsData = [];

      for (const cartItem of cartItems) {
        const dbItem = await Item.findById(cartItem.item).session(session);
        if (!dbItem) throw new Error(`Item ${cartItem.item} no longer exists`);

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
        throw { statusCode: 400, message: `Prices have been updated! The new total is ₹${orderTotalPrice}. Please review your cart to continue.` };
      }

      const [order] = await Order.create(
        [{
          user: userId,
          restaurant: restaurantId,
          deliveryInfo,
          totalPrice: orderTotalPrice,
          paymentStatus: false,
          deliveryStatus: "pending",
        }],
        { session }
      );

      const populatedOrderItems = orderItemsData.map((item) => ({
        ...item,
        order: order._id,
      }));
      await OrderItem.insertMany(populatedOrderItems, { session });

      await session.commitTransaction();
      return { orderId: order._id, totalPrice: order.totalPrice, restaurant: order.restaurant, itemCount: orderItemsData.length };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getMyOrders(userId, statusFilter) {
    let matchStage = { user: new mongoose.Types.ObjectId(userId) };

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

    const orders = await Order.aggregate([
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
      { $lookup: { from: "orderitems", localField: "_id", foreignField: "order", as: "items" } },
      { $lookup: { from: "restaurants", localField: "restaurant", foreignField: "_id", as: "restaurantInfo" } },
      { $unwind: "$restaurantInfo" },
      { $project: {
          totalPrice: 1, paymentStatus: 1, deliveryStatus: 1, createdAt: 1, deliveryInfo: 1,
          "restaurant.name": "$restaurantInfo.name",
          items: { _id: 1, item: 1, itemName: 1, quantity: 1, totalPrice: 1 },
      } },
    ]);

    // Check if items are reviewed
    const orderIds = orders.map(o => o._id);
    const feedbacks = await Feedback.find({
      order: { $in: orderIds },
      user: userId
    }).lean();

    const reviewedMap = {};
    feedbacks.forEach(f => {
      reviewedMap[`${f.order.toString()}_${f.item.toString()}`] = true;
    });

    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          item.hasReviewed = !!reviewedMap[`${order._id.toString()}_${item.item.toString()}`];
        });
      }
    });

    return orders;
  }

  async getRestaurantForUser(user) {
    if (user.role === 'owner') {
      return await Restaurant.findOne({ owner: user._id, status: { $ne: "deleted" } });
    } else if (user.role === 'manager') {
      const managerProfile = await Manager.findOne({ user: user._id });
      if (managerProfile) {
        return await Restaurant.findOne({ _id: managerProfile.restaurant, status: { $ne: "deleted" } });
      }
    }
    return null;
  }

  async getRestaurantOrders(user) {
    const restaurant = await this.getRestaurantForUser(user);
    if (!restaurant) throw { statusCode: 404, message: "Restaurant not found" };

    return await Order.aggregate([
      { $match: { restaurant: restaurant._id, paymentStatus: true } },
      { $sort: { createdAt: -1 } },
      { $lookup: { from: "orderitems", localField: "_id", foreignField: "order", as: "items" } },
      { $addFields: {
          orderStatus: {
            $cond: {
              if: { $eq: ["$paymentStatus", false] }, then: "Payment Left",
              else: { $cond: { if: { $eq: ["$deliveryStatus", "delivered"] }, then: "Delivered", else: "Pending" } },
            },
          },
        },
      },
      { $project: {
          "deliveryInfo.name": 1, "deliveryInfo.phone": 1, "deliveryInfo.address": 1,
          totalPrice: 1, orderStatus: 1, paymentStatus: 1, deliveryStatus: 1, createdAt: 1,
          items: { itemName: 1, quantity: 1, totalPrice: 1 },
      } },
    ]);
  }

  async updateDeliveryStatus(user, orderId, deliveryStatus, io) {
    const restaurant = await this.getRestaurantForUser(user);
    if (!restaurant) throw { statusCode: 404, message: "Restaurant not found" };

    const order = await Order.findOne({ _id: orderId, restaurant: restaurant._id });
    if (!order) throw { statusCode: 404, message: "Order not found or unauthorized" };

    const VALID_TRANSITIONS = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['out-for-delivery', 'cancelled'],
      'out-for-delivery': ['delivered'],
      delivered: [],
      cancelled: [],
    };

    if (!VALID_TRANSITIONS[order.deliveryStatus]?.includes(deliveryStatus)) {
      throw { statusCode: 400, message: `Invalid status transition from ${order.deliveryStatus} to ${deliveryStatus}` };
    }

    order.deliveryStatus = deliveryStatus;
    await order.save();

    if (deliveryStatus === 'cancelled') {
      await OrderItem.deleteMany({ order: order._id });
    }

    if (io) {
      let customMessage = `Your order status is now: ${deliveryStatus}`;
      if (deliveryStatus === "cancelled") {
        customMessage = "Your order was cancelled due to unforeseen issues. Your money will be credited back to your account within 2-3 working days.";
      }
      
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

    return order;
  }

  async getTransactions(user, search, startDate, endDate) {
    const restaurant = await this.getRestaurantForUser(user);
    if (!restaurant) throw { statusCode: 404, message: 'Restaurant not found' };

    let matchStage = { restaurant: restaurant._id, paymentStatus: true };

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
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

    return await Order.aggregate([
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
      { $limit: 50 },
      { $project: { _id: 1, "deliveryInfo.name": 1, totalPrice: 1, createdAt: 1, deliveryStatus: 1 } }
    ]);
  }

  async getDashboardStats(user) {
    const restaurant = await this.getRestaurantForUser(user);
    if (!restaurant) throw { statusCode: 404, message: 'Restaurant not found' };

    const stats = await Order.aggregate([
      { $match: { restaurant: restaurant._id } },
      { $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: { $cond: [{ $and: [{ $eq: ["$paymentStatus", true] }, { $ne: ["$deliveryStatus", "cancelled"] }]}, "$totalPrice", 0] } },
          pendingOrders: { $sum: { $cond: [{ $and: [{ $eq: ["$paymentStatus", true] }, { $ne: ["$deliveryStatus", "delivered"] }, { $ne: ["$deliveryStatus", "cancelled"] }]}, 1, 0] } },
          deliveredOrders: { $sum: { $cond: [{ $eq: ["$deliveryStatus", "delivered"] }, 1, 0] } },
          cancelledOrders: { $sum: { $cond: [{ $eq: ["$deliveryStatus", "cancelled"] }, 1, 0] } }
      }},
      { $project: { _id: 0, totalOrders: 1, totalRevenue: 1, pendingOrders: 1, deliveredOrders: 1, cancelledOrders: 1 } }
    ]);

    return stats.length > 0 ? stats[0] : { totalOrders: 0, totalRevenue: 0, pendingOrders: 0, deliveredOrders: 0, cancelledOrders: 0 };
  }

  async cancelOrder(userId, orderId) {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) throw { statusCode: 404, message: "Order not found" };
    
    if (order.paymentStatus === true) throw { statusCode: 400, message: "Cannot cancel a paid order" };

    order.deliveryStatus = "cancelled";
    await order.save();
    await OrderItem.deleteMany({ order: order._id });

    return true;
  }
}

module.exports = new OrderService();
