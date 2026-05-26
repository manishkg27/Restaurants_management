const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const PaymentHistory = require("../models/PaymentHistory");

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order for checkout
// @route   POST /api/payments/checkout/:orderId
// @access  Private
const createRazorpayOrder = async (req, res) => {
  try {
    // 1. Fetch the Eatify Order
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user._id,
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.paymentStatus) {
      return res
        .status(400)
        .json({ success: false, message: "Order is already paid" });
    }

    // 2. Set up Razorpay options (amount must be in paise/smallest currency unit)
    const options = {
      amount: order.totalPrice * 100, // Multiply by 100 for INR (₹1050 = 105000 paise)
      currency: "INR",
      receipt: order._id.toString(),
    };

    // 3. Create order on Razorpay servers
    const razorpayOrder = await razorpay.orders.create(options);

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
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // 1. Fetch the order associated with this Razorpay order ID
    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
      user: req.user._id,
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
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
      // 4a. Signature matches -> Mark order as paid
      order.paymentStatus = true;
      await order.save();

      // 4b. Log the payment history
      await PaymentHistory.create({
        order: order._id,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      });

      res.json({
        success: true,
        data: { orderId: order._id, paymentStatus: true },
        message: "Payment verified successfully",
      });
    } else {
      // 5. Signature mismatch
      res
        .status(400)
        .json({
          success: false,
          message: "Payment verification failed — signature mismatch",
        });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createRazorpayOrder, verifyPayment };
