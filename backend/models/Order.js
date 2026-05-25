const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Order must reference a restaurant"],
    },
    deliveryInfo: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pinCode: { type: String, required: true },
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: Boolean,
      default: false,
    },
    deliveryStatus: {
      type: String,
      enum: {
        values: ["pending", "confirmed", "delivered"],
        message: "{VALUE} is not a valid delivery status",
      },
      default: "pending",
    },
    razorpayOrderId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for fast querying (User history, Restaurant dashboard)
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, deliveryStatus: 1 });
orderSchema.index({ razorpayOrderId: 1 });

module.exports = mongoose.model("Order", orderSchema);
