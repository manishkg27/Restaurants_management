const express = require("express");
const router = express.Router();
const {
  createItem,
  getItems,
  searchItems,
} = require("../controllers/itemController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/search", searchItems);
router.get("/", getItems);
router.post("/:restaurantId", protect, upload.single("image"), createItem);

module.exports = router;
