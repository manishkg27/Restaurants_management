const mongoose = require("mongoose");

const managerSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Manager must be linked to a restaurant"],
      unique: true, // One manager profile per restaurant
    },
    name: {
      type: String,
      required: [true, "Manager name is required"],
      maxlength: 100,
    },
    contact: { type: String, required: [true, "Contact is required"] },
    email: {
      type: String,
      required: [true, "Email is required"],
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Invalid email"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      maxlength: 300,
    },
    bankName: { type: String, required: [true, "Bank name is required"] },
    bankBranch: { type: String, required: [true, "Bank branch is required"] },
    bankIFSC: { type: String, required: [true, "IFSC code is required"] },
    bankAccount: { type: String, required: [true, "Bank account is required"] },
    about: { type: String, default: "", maxlength: 500 },
  },
  {
    timestamps: true,
  },
);

managerSchema.index({ restaurant: 1 });

module.exports = mongoose.model("Manager", managerSchema);
