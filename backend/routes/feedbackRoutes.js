const express = require("express");
const router = express.Router();
const {
  submitFeedback,
  getItemFeedback,
} = require("../controllers/feedbackController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, submitFeedback);
router.get("/item/:itemId", getItemFeedback);

module.exports = router;
