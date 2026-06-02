const express = require("express");
const router = express.Router();
const {
  createManager,
  getMyManager,
  updateManager,
} = require("../../controllers/managerController");
const { protect, authorizeRole } = require("../../middleware/authMiddleware");
const validate = require("../../middleware/validate");
const { createManagerSchema, updateManagerSchema } = require("../../validators/managerValidator");

router.use(protect);
router.use(authorizeRole("owner"));

router.post("/", validate(createManagerSchema), createManager);
router.get("/my-restaurant", getMyManager);
router.put("/:managerId", validate(updateManagerSchema), updateManager);

module.exports = router;
