// backend/src/controllers/busController.js

const Bus = require("../models/Bus");
const User = require("../models/User");

// @route   POST /api/buses
// @access  Private/Admin
const createBus = async (req, res) => {
  try {
    const { busNumber, busType, capacity, assignedDriver, currentRoute } =
      req.body;

    if (!busNumber) {
      return res.status(400).json({
        success: false,
        message: "busNumber is required",
      });
    }

    // If an assignedDriver ID was provided, confirm that user
    // actually exists AND has role "driver"
    if (assignedDriver) {
      const driver = await User.findById(assignedDriver);
      if (!driver || driver.role !== "driver") {
        return res.status(400).json({
          success: false,
          message: "assignedDriver must be a valid user with role 'driver'",
        });
      }
    }

    const bus = await Bus.create({
      busNumber,
      busType,
      capacity,
      assignedDriver: assignedDriver || null,
      currentRoute: currentRoute || null,
    });

    res.status(201).json({
      success: true,
      message: "Bus created successfully",
      bus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while creating bus",
      error: error.message,
    });
  }
};

// @route   GET /api/buses
// @access  Public
const getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.find()
      .populate("assignedDriver", "name email phone") // only these fields, not everything
      .populate("currentRoute", "routeName routeNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: buses.length,
      buses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching buses",
      error: error.message,
    });
  }
};

// @route   GET /api/buses/:id
// @access  Public
const getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id)
      .populate("assignedDriver", "name email phone")
      .populate("currentRoute", "routeName routeNumber");

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    res.status(200).json({
      success: true,
      bus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching bus",
      error: error.message,
    });
  }
};

// @route   PUT /api/buses/:id
// @access  Private/Admin
const updateBus = async (req, res) => {
  try {
    const { busNumber, busType, capacity, assignedDriver, currentRoute, status } =
      req.body;

    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    if (assignedDriver) {
      const driver = await User.findById(assignedDriver);
      if (!driver || driver.role !== "driver") {
        return res.status(400).json({
          success: false,
          message: "assignedDriver must be a valid user with role 'driver'",
        });
      }
      bus.assignedDriver = assignedDriver;
    }

    if (busNumber) bus.busNumber = busNumber;
    if (busType) bus.busType = busType;
    if (capacity) bus.capacity = capacity;
    if (currentRoute) bus.currentRoute = currentRoute;
    if (status) bus.status = status;

    await bus.save();

    res.status(200).json({
      success: true,
      message: "Bus updated successfully",
      bus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while updating bus",
      error: error.message,
    });
  }
};

// @route   DELETE /api/buses/:id
// @access  Private/Admin
const deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    await bus.deleteOne();

    res.status(200).json({
      success: true,
      message: "Bus deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while deleting bus",
      error: error.message,
    });
  }
};

module.exports = {
  createBus,
  getAllBuses,
  getBusById,
  updateBus,
  deleteBus,
};