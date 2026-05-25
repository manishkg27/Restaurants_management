const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Cart must belong to a user"],
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: [true, "Cart must reference an item"],
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Cart must reference a restaurant"],
    },
    quantity: {
      type: Number,
      default: 1,
      min: [1, "Quantity must be at least 1"],
      max: [50, "Quantity cannot exceed 50"],
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for fast querying and preventing duplicate items
cartSchema.index({ user: 1 });
cartSchema.index({ user: 1, item: 1 }, { unique: true });
cartSchema.index({ user: 1, restaurant: 1 });

module.exports = mongoose.model("Cart", cartSchema);
