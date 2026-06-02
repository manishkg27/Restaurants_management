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
const validate = require("../../middleware/validate");
const { createItemSchema, updateItemSchema } = require("../../validators/itemValidator");

router.get("/search", searchItems);
router.get("/", getItems);
router.post("/:restaurantId", protect, authorizeRole("owner", "manager"), upload.single("image"), validate(createItemSchema), createItem);
router.put("/:itemId", protect, authorizeRole("owner", "manager"), upload.single("image"), validate(updateItemSchema), updateItem);
router.delete("/:itemId", protect, authorizeRole("owner", "manager"), deleteItem);

module.exports = router;
