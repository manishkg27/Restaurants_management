const express = require("express");
const router = express.Router();
const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

// All cart routes require authentication
router.use(protect);

router.route("/").post(addToCart).get(getCart);

// MUST be placed before /:cartId to avoid parameter collision
router.delete("/clear", clearCart);

router.route("/:cartId").patch(updateCartQuantity).delete(removeFromCart);

module.exports = router;
