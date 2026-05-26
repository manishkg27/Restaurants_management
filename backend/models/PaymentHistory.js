const mongoose = require("mongoose");

const paymentHistorySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Payment must reference an order"],
    },
    razorpayOrderId: {
      type: String,
      required: [true, "Razorpay order ID is required"],
    },
    razorpayPaymentId: {
      type: String,
      required: [true, "Razorpay payment ID is required"],
    },
    razorpaySignature: {
      type: String,
      required: [true, "Razorpay signature is required"],
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for fast lookup during verification and audits
paymentHistorySchema.index({ order: 1 });
paymentHistorySchema.index({ razorpayOrderId: 1 });

module.exports = mongoose.model("PaymentHistory", paymentHistorySchema);
