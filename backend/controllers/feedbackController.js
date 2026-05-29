const Feedback = require("../models/Feedback");
const Item = require("../models/Item");
const Order = require("../models/Order");

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
// @desc    Submit feedback/rating for a food item
// @route   POST /api/feedback
// @access  Private
const submitFeedback = async (req, res) => {
  try {
    const { itemId, orderId, rating, experience } = req.body;
    const userId = req.user._id;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required to submit feedback" });
    }

    // 1. Verify the item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }


    // 3. Create the feedback (this will fail with 11000 if user already reviewed due to the unique index)
    let feedback;
    try {
      feedback = await Feedback.create({
        user: userId,
        item: itemId,
        order: orderId,
        rating,
        experience,
      });
    } catch (err) {
      if (err.code === 11000) {
        return res
          .status(409)
          .json({
            success: false,
            message: "You have already reviewed this item for this order",
          });
      }
      throw err;
    }

    // 4. Recalculate the exact average rating
    await recalculateItemRating(item._id);

    res.status(201).json({
      success: true,
      data: feedback,
      message: "Feedback submitted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reviews for a specific food item
// @route   GET /api/feedback/item/:itemId
// @access  Public
const getItemFeedback = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check if a user has already reviewed an item for a specific order
// @route   GET /api/feedback/check/:orderId/:itemId
// @access  Private
const checkFeedback = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an existing feedback
// @route   PUT /api/feedback/:feedbackId
// @access  Private
const updateFeedback = async (req, res) => {
  try {
    const { rating, experience } = req.body;
    const feedbackId = req.params.feedbackId;

    let feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }

    if (feedback.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this feedback" });
    }

    feedback.rating = rating;
    feedback.experience = experience;
    await feedback.save();

    // Recalculate average rating
    await recalculateItemRating(feedback.item);

    res.json({
      success: true,
      data: feedback,
      message: "Feedback updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { submitFeedback, getItemFeedback, checkFeedback, updateFeedback };
