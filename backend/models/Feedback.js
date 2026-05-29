const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Feedback must belong to a user"],
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: [true, "Feedback must reference an item"],
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Feedback must reference an order"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    experience: {
      type: String,
      required: [true, "Experience/review text is required"],
      maxlength: [2000, "Review cannot exceed 2000 characters"],
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
feedbackSchema.index({ item: 1, createdAt: -1 }); // Fast loading of item reviews
feedbackSchema.index({ user: 1 }); // Find all reviews by a user
feedbackSchema.index({ user: 1, item: 1, order: 1 }, { unique: true }); // Prevent multiple reviews from same user on same item in the same order

module.exports = mongoose.model("Feedback", feedbackSchema);
