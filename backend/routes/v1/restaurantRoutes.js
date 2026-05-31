const express = require("express");
const router = express.Router();
const {
  createRestaurant,
  getRestaurants,
  getMyRestaurant,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
} = require("../../controllers/restaurantController");
const { protect, authorizeRole } = require("../../middleware/authMiddleware");
const upload = require("../../middleware/uploadMiddleware");

const cpUpload = upload.fields([
  { name: "restaurantImage", maxCount: 1 },
]);

router.route("/").post(protect, authorizeRole("owner"), cpUpload, createRestaurant).get(getRestaurants);

router.get("/mine", protect, authorizeRole("owner", "manager"), getMyRestaurant);
router.get("/:id", getRestaurantById);
router.put("/:id", protect, authorizeRole("owner", "manager"), cpUpload, updateRestaurant);
router.delete("/:id", protect, authorizeRole("owner"), deleteRestaurant);

module.exports = router;
