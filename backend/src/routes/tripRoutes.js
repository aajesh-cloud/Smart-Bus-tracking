// backend/src/routes/tripRoutes.js

const express = require("express");
const router = express.Router();
const {
  startTrip,
  stopTrip,
  updateLocation,
  getAllLiveLocations,
  getMyTripStatus,
} = require("../controllers/tripController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/live-locations", getAllLiveLocations);

router.get("/my-status", protect, authorize("driver"), getMyTripStatus);
router.post("/start", protect, authorize("driver"), startTrip);
router.post("/stop", protect, authorize("driver"), stopTrip);
router.post("/update-location", protect, authorize("driver"), updateLocation);

module.exports = router;