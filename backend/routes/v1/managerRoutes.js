const express = require("express");
const router = express.Router();
const {
  createManager,
  getMyManager,
  updateManager,
} = require("../../controllers/managerController");
const { protect, authorizeRole } = require("../../middleware/authMiddleware");

router.use(protect);
router.use(authorizeRole("owner"));

router.post("/", createManager);
router.get("/my-restaurant", getMyManager);
router.put("/:managerId", updateManager);

module.exports = router;
