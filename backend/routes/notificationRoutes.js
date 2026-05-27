const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

router.use(protect);

router.route("/").get(getNotifications);
router.route("/read-all").patch(markAllAsRead);
router.route("/:id/read").patch(markAsRead);
router.route("/:id").delete(deleteNotification);

module.exports = router;
