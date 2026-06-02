const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const PaymentHistory = require("../models/PaymentHistory");
const Notification = require("../models/Notification");
const Restaurant = require("../models/Restaurant");
const Manager = require("../models/Manager");
const Cart = require("../models/Cart");
const AppError = require("../utils/AppError");
const { asyncHandler } = require("../middleware/errorHandler");

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order for checkout
// @route   POST /api/payments/checkout/:orderId
// @access  Private
const createRazorpayOrder = asyncHandler(async (req, res) => {
  // 1. Fetch the Eatify Order
  const order = await Order.findOne({
    _id: req.params.orderId,
    user: req.user._id,
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (order.paymentStatus) {
    throw new AppError("Order is already paid", 400);
  }

  // 2. Set up Razorpay options (amount must be in paise/smallest currency unit)
  // Razorpay minimum amount is 1 INR (100 paise)
  const amountInPaise = Math.max(100, Math.round(order.totalPrice * 100));
  
  const options = {
    amount: amountInPaise,
    currency: "INR",
    receipt: `rcpt_${order._id}`,
  };

  let razorpayOrder;
  try {
    // 3. Create order on Razorpay servers
    razorpayOrder = await razorpay.orders.create(options);
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    throw new AppError(error.description || error.message || "Failed to create Razorpay order", 500);
  }

  // 4. Temporarily attach the Razorpay Order ID to our local order
  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  // 5. Send data to frontend to open the payment gateway
  res.json({
    success: true,
    data: {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID, // Frontend needs public key to invoke the modal
    },
  });
});

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  // 1. Fetch the order associated with this Razorpay order ID
  const order = await Order.findOne({
    razorpayOrderId: razorpay_order_id,
    user: req.user._id,
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // 2. Generate our own signature using the secret key
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  // 3. Compare signatures to prevent spoofing
  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    // 4. Double check payment status with Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    if (payment.order_id !== razorpay_order_id || payment.status !== "captured") {
      throw new AppError("Payment not captured or mismatch", 400);
    }

    // 5a. Signature matches & captured -> Mark order as paid
    order.paymentStatus = true;
    await order.save();

    // 4a2. Clear the cart
    await Cart.deleteMany({ user: order.user });

    // 4b. Log the payment history
    await PaymentHistory.create({
      order: order._id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    // 4c. Socket.io trigger and Notification for real-time dashboard updates
    const restaurantDoc = await Restaurant.findById(order.restaurant);
    if (restaurantDoc) {
      const msg = `New Order #${order._id} has been placed!`;
      
      // Notification for Owner
      if (restaurantDoc.owner) {
        await Notification.create({
          recipient: restaurantDoc.owner,
          type: "new_order",
          message: msg,
          relatedOrder: order._id,
        });
      }

      // Notifications for Managers
      const managers = await Manager.find({ restaurant: order.restaurant });
      if (managers && managers.length > 0) {
        const managerNotifications = managers
          .filter(mgr => mgr.user)
          .map(mgr => ({
            recipient: mgr.user,
            type: "new_order",
            message: msg,
            relatedOrder: order._id,
          }));
        
        if (managerNotifications.length > 0) {
          await Notification.insertMany(managerNotifications);
        }
      }

      const io = req.app.get("io");
      if (io) {
        io.to(`restaurant_${order.restaurant.toString()}`).emit("newOrder", {
          message: msg,
          orderId: order._id,
          totalPrice: order.totalPrice,
        });
      }
    }

    res.json({
      success: true,
      data: { orderId: order._id, paymentStatus: true },
      message: "Payment verified successfully",
    });
  } else {
    // 5. Signature mismatch
    throw new AppError("Payment verification failed — signature mismatch", 400);
  }
});

module.exports = { createRazorpayOrder, verifyPayment };
