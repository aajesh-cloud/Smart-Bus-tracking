// backend/src/routes/busRoutes.js

const express = require("express");
const router = express.Router();
const {
  createBus,
  getAllBuses,
  getBusById,
  updateBus,
  deleteBus,
} = require("../controllers/busController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", getAllBuses);
router.get("/:id", getBusById);

router.post("/", protect, authorize("admin"), createBus);
router.put("/:id", protect, authorize("admin"), updateBus);
router.delete("/:id", protect, authorize("admin"), deleteBus);

module.exports = router;