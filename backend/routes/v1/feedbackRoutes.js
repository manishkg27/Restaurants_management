const express = require("express");
const router = express.Router();
const {
  submitFeedback,
  getItemFeedback,
  checkFeedback,
  updateFeedback,
} = require("../../controllers/feedbackController");
const { protect } = require("../../middleware/authMiddleware");

router.post("/", protect, submitFeedback);
router.get("/check/:orderId/:itemId", protect, checkFeedback);
router.put("/:feedbackId", protect, updateFeedback);
router.get("/item/:itemId", getItemFeedback);

module.exports = router;
