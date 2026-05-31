const express = require("express");
const router = express.Router();
const {
  createItem,
  getItems,
  searchItems,
  updateItem,
  deleteItem,
} = require("../../controllers/itemController");
const { protect, authorizeRole } = require("../../middleware/authMiddleware");
const upload = require("../../middleware/uploadMiddleware");

router.get("/search", searchItems);
router.get("/", getItems);
router.post("/:restaurantId", protect, authorizeRole("owner", "manager"), upload.single("image"), createItem);
router.put("/:itemId", protect, authorizeRole("owner", "manager"), upload.single("image"), updateItem);
router.delete("/:itemId", protect, authorizeRole("owner", "manager"), deleteItem);

module.exports = router;
