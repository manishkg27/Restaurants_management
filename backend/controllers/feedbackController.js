const Feedback = require("../models/Feedback");
const Item = require("../models/Item");
const Order = require("../models/Order");

// @desc    Submit feedback/rating for a food item
// @route   POST /api/feedback
// @access  Private
const submitFeedback = async (req, res) => {
  try {
    const { itemId, rating, experience } = req.body;
    const userId = req.user._id;

    // 1. Verify the item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    // 2. (Optional but recommended) Check if user actually ordered this item before
    // We look in the user's past delivered orders for this item
    /*
    const hasOrdered = await Order.aggregate([
      { $match: { user: userId, deliveryStatus: 'delivered' } },
      { $lookup: { from: 'orderitems', localField: '_id', foreignField: 'order', as: 'items' } },
      { $match: { "items.item": item._id } }
    ]);
    if (hasOrdered.length === 0) {
      return res.status(403).json({ success: false, message: 'You can only review items you have ordered and received' });
    }
    */

    // 3. Create the feedback (this will fail with 11000 if user already reviewed due to the unique index)
    let feedback;
    try {
      feedback = await Feedback.create({
        user: userId,
        item: itemId,
        rating,
        experience,
      });
    } catch (err) {
      if (err.code === 11000) {
        return res
          .status(409)
          .json({
            success: false,
            message: "You have already reviewed this item",
          });
      }
      throw err;
    }

    // 4. Recalculate the exact average rating using MongoDB Aggregation
    const stats = await Feedback.aggregate([
      { $match: { item: item._id } },
      {
        $group: {
          _id: "$item",
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    // 5. Update the Item document with the fresh stats
    if (stats.length > 0) {
      await Item.findByIdAndUpdate(itemId, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal place (e.g., 4.3)
        totalRatings: stats[0].totalRatings,
      });
    }

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

module.exports = { submitFeedback, getItemFeedback };
