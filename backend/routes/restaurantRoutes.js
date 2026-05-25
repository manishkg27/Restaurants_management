const express = require("express");
const router = express.Router();
const {
  createRestaurant,
  getRestaurants,
  getMyRestaurant,
  getRestaurantById,
  updateRestaurant,
} = require("../controllers/restaurantController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const cpUpload = upload.fields([
  { name: "menuImage", maxCount: 1 },
  { name: "restaurantImage", maxCount: 1 },
]);

router.route("/").post(protect, cpUpload, createRestaurant).get(getRestaurants);

router.get("/mine", protect, getMyRestaurant);
router.get("/:id", getRestaurantById);
router.put("/:id", protect, cpUpload, updateRestaurant);

module.exports = router;
