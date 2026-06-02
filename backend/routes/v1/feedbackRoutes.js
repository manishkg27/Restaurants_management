const express = require("express");
const router = express.Router();
const {
  submitFeedback,
  getItemFeedback,
  checkFeedback,
  updateFeedback,
} = require("../../controllers/feedbackController");
const { protect } = require("../../middleware/authMiddleware");
const validate = require("../../middleware/validate");
const {
  submitFeedbackSchema,
  updateFeedbackSchema,
} = require("../../validators/feedbackValidator");

router.post("/", protect, validate(submitFeedbackSchema), submitFeedback);
router.get("/check/:orderId/:itemId", protect, checkFeedback);
router.put("/:feedbackId", protect, validate(updateFeedbackSchema), updateFeedback);
router.get("/item/:itemId", getItemFeedback);

module.exports = router;
