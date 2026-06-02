const Feedback = require("../models/Feedback");
const Item = require("../models/Item");
const Restaurant = require("../models/Restaurant");
const AppError = require("../utils/AppError");
const { asyncHandler } = require("../middleware/errorHandler");

const recalculateItemRating = async (itemId) => {
  const stats = await Feedback.aggregate([
    { $match: { item: itemId } },
    {
      $group: {
        _id: "$item",
        averageRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Item.findByIdAndUpdate(itemId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalRatings: stats[0].totalRatings,
    });
  }
};

const recalculateRestaurantRating = async (restaurantId) => {
  const stats = await Feedback.aggregate([
    { $match: { restaurant: restaurantId } },
    {
      $group: {
        _id: "$restaurant",
        averageRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Restaurant.findByIdAndUpdate(restaurantId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalRatings: stats[0].totalRatings,
    });
  }
};

// @desc    Submit feedback/rating for a food item
// @route   POST /api/feedback
// @access  Private
const submitFeedback = asyncHandler(async (req, res) => {
  const { itemId, orderId, rating, experience } = req.body;
  const userId = req.user._id;

  if (!orderId) {
    throw new AppError("Order ID is required to submit feedback", 400);
  }

  // 1. Verify the item exists
  const item = await Item.findById(itemId);
  if (!item) {
    throw new AppError("Item not found", 404);
  }

  // 3. Create the feedback (this will fail with 11000 if user already reviewed due to the unique index)
  let feedback;
  try {
    feedback = await Feedback.create({
      user: userId,
      item: itemId,
      restaurant: item.restaurant,
      order: orderId,
      rating,
      experience,
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError("You have already reviewed this item for this order", 409);
    }
    throw err;
  }

  // 4. Recalculate the exact average rating
  await recalculateItemRating(item._id);
  await recalculateRestaurantRating(item.restaurant);

  res.status(201).json({
    success: true,
    data: feedback,
    message: "Feedback submitted successfully",
  });
});

// @desc    Get all reviews for a specific food item
// @route   GET /api/feedback/item/:itemId
// @access  Public
const getItemFeedback = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const feedback = await Feedback.find({ item: req.params.itemId })
    .populate("user", "username profile.fullName") // Only get public user info
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Feedback.countDocuments({ item: req.params.itemId });

  res.json({
    success: true,
    data: feedback,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Check if a user has already reviewed an item for a specific order
// @route   GET /api/feedback/check/:orderId/:itemId
// @access  Private
const checkFeedback = asyncHandler(async (req, res) => {
  const { orderId, itemId } = req.params;
  const feedback = await Feedback.findOne({
    user: req.user._id,
    order: orderId,
    item: itemId,
  });
  
  if (feedback) {
    res.json({ success: true, hasReviewed: true, data: feedback });
  } else {
    res.json({ success: true, hasReviewed: false });
  }
});

// @desc    Update an existing feedback
// @route   PUT /api/feedback/:feedbackId
// @access  Private
const updateFeedback = asyncHandler(async (req, res) => {
  const { rating, experience } = req.body;
  const feedbackId = req.params.feedbackId;

  let feedback = await Feedback.findById(feedbackId);

  if (!feedback) {
    throw new AppError("Feedback not found", 404);
  }

  if (feedback.user.toString() !== req.user._id.toString()) {
    throw new AppError("Not authorized to update this feedback", 403);
  }

  feedback.rating = rating;
  feedback.experience = experience;
  await feedback.save();

  // Recalculate average rating
  await recalculateItemRating(feedback.item);
  await recalculateRestaurantRating(feedback.restaurant);

  res.json({
    success: true,
    data: feedback,
    message: "Feedback updated successfully",
  });
});

module.exports = { submitFeedback, getItemFeedback, checkFeedback, updateFeedback };
