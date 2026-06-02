const express = require("express");
const router = express.Router();
const { updateProfile, addAddress, updateAddress, deleteAddress } = require("../../controllers/userController");
const { protect } = require("../../middleware/authMiddleware");
const validate = require("../../middleware/validate");
const { updateProfileSchema, addAddressSchema, updateAddressSchema } = require("../../validators/userValidator");

router.put("/profile", protect, validate(updateProfileSchema), updateProfile);
router.post("/addresses", protect, validate(addAddressSchema), addAddress);
router.put("/addresses/:addressId", protect, validate(updateAddressSchema), updateAddress);
router.delete("/addresses/:addressId", protect, deleteAddress);

module.exports = router;
