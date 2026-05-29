const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 255 },
    description: { type: String, required: true, maxlength: 1000 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" },
    isVegetarian: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

itemSchema.index({ name: "text", description: "text" });
itemSchema.index({ price: 1 });
itemSchema.index({ averageRating: -1 });

module.exports = mongoose.model("Item", itemSchema);
