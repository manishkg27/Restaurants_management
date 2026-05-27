const express = require("express");
const router = express.Router();
const {
  createItem,
  getItems,
  searchItems,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/search", searchItems);
router.get("/", getItems);
router.post("/:restaurantId", protect, upload.single("image"), createItem);
router.put("/:itemId", protect, upload.single("image"), updateItem);
router.delete("/:itemId", protect, deleteItem);

module.exports = router;
