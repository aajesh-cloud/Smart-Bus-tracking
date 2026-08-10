// backend/src/routes/stopRoutes.js

const express = require("express");
const router = express.Router();
const {
  createStop,
  getAllStops,
  getStopById,
  updateStop,
  deleteStop,
} = require("../controllers/stopController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public routes — anyone can view stops
router.get("/", getAllStops);
router.get("/:id", getStopById);

// Admin-only routes — must be logged in AND have role "admin"
router.post("/", protect, authorize("admin"), createStop);
router.put("/:id", protect, authorize("admin"), updateStop);
router.delete("/:id", protect, authorize("admin"), deleteStop);

module.exports = router;