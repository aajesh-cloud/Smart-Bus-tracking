// backend/src/routes/authRoutes.js

const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getAllDrivers,
  updateDriver,
  deleteDriver,
} = require("../controllers/authController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/me", protect, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

router.get("/admin-only", protect, authorize("admin"), (req, res) => {
  res.status(200).json({
    success: true,
    message: `Welcome, admin ${req.user.name}!`,
  });
});

// Driver management — admin only
router.get("/drivers", protect, authorize("admin"), getAllDrivers);
router.put("/drivers/:id", protect, authorize("admin"), updateDriver);
router.delete("/drivers/:id", protect, authorize("admin"), deleteDriver);

module.exports = router;