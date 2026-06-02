const express = require("express");
const router = express.Router();
const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} = require("../../controllers/cartController");
const { protect } = require("../../middleware/authMiddleware");
const validate = require("../../middleware/validate");
const {
  addToCartSchema,
  updateCartQuantitySchema,
} = require("../../validators/cartValidator");

// All cart routes require authentication
router.use(protect);

router.route("/")
  .post(validate(addToCartSchema), addToCart)
  .get(getCart);

// MUST be placed before /:cartId to avoid parameter collision
router.delete("/clear", clearCart);

router.route("/:cartId")
  .patch(validate(updateCartQuantitySchema), updateCartQuantity)
  .delete(removeFromCart);

module.exports = router;
