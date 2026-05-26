const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Restaurant must have an owner"],
      unique: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    location: { type: String, required: true, maxlength: 200 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    state: { type: String, required: true, trim: true, maxlength: 100 },
    country: { type: String, required: true, trim: true, maxlength: 100 },
    pinCode: {
      type: String,
      required: true,
      match: [/^[0-9]{5,10}$/, "Invalid pin code"],
    },
    restaurantContact: { type: String, required: true },
    ownerContact: { type: String, required: true },
    ownerName: { type: String, required: true, maxlength: 100 },
    ownerEmail: {
      type: String,
      required: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Invalid email"],
    },
    openTime: { type: String, required: true },
    closeTime: { type: String, required: true },
    menuImage: { type: String, default: "" },
    restaurantImage: { type: String, default: "" },
  },
  { timestamps: true },
);

// Indexes for search
restaurantSchema.index({ name: "text", city: "text", location: "text" });

module.exports = mongoose.model("Restaurant", restaurantSchema);
