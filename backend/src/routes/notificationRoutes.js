// backend/src/routes/notificationRoutes.js

const express = require("express");
const router = express.Router();
const {
  setFavoriteStop,
  getMyNotifications,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getMyNotifications);
router.put("/favorite-stop", protect, setFavoriteStop);

module.exports = router;