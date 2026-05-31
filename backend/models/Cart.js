const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Cart must belong to a user"],
      unique: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Cart must reference a restaurant"],
    },
    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          required: [true, "Cart item must reference an item"],
        },
        quantity: {
          type: Number,
          default: 1,
          min: [1, "Quantity must be at least 1"],
          max: [50, "Quantity cannot exceed 50"],
        },
      }
    ]
  },
  {
    timestamps: true,
  },
);

// Indexes
module.exports = mongoose.model("Cart", cartSchema);
