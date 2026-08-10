// backend/src/controllers/stopController.js

const Stop = require("../models/Stop");

// @route   POST /api/stops
// @access  Private/Admin
const createStop = async (req, res) => {
  try {
    const { stopName, longitude, latitude } = req.body;

    if (!stopName || longitude === undefined || latitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "stopName, longitude, and latitude are required",
      });
    }

    const stop = await Stop.create({
      stopName,
      location: {
        type: "Point",
        coordinates: [longitude, latitude], // GeoJSON order: [lng, lat]
      },
    });

    res.status(201).json({
      success: true,
      message: "Stop created successfully",
      stop,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while creating stop",
      error: error.message,
    });
  }
};

// @route   GET /api/stops
// @access  Public
const getAllStops = async (req, res) => {
  try {
    const stops = await Stop.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: stops.length,
      stops,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching stops",
      error: error.message,
    });
  }
};

// @route   GET /api/stops/:id
// @access  Public
const getStopById = async (req, res) => {
  try {
    const stop = await Stop.findById(req.params.id);

    if (!stop) {
      return res.status(404).json({
        success: false,
        message: "Stop not found",
      });
    }

    res.status(200).json({
      success: true,
      stop,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching stop",
      error: error.message,
    });
  }
};

// @route   PUT /api/stops/:id
// @access  Private/Admin
const updateStop = async (req, res) => {
  try {
    const { stopName, longitude, latitude } = req.body;

    const stop = await Stop.findById(req.params.id);
    if (!stop) {
      return res.status(404).json({
        success: false,
        message: "Stop not found",
      });
    }

    if (stopName) stop.stopName = stopName;
    if (longitude !== undefined && latitude !== undefined) {
      stop.location.coordinates = [longitude, latitude];
    }

    await stop.save();

    res.status(200).json({
      success: true,
      message: "Stop updated successfully",
      stop,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while updating stop",
      error: error.message,
    });
  }
};

// @route   DELETE /api/stops/:id
// @access  Private/Admin
const deleteStop = async (req, res) => {
  try {
    const stop = await Stop.findById(req.params.id);
    if (!stop) {
      return res.status(404).json({
        success: false,
        message: "Stop not found",
      });
    }

    await stop.deleteOne();

    res.status(200).json({
      success: true,
      message: "Stop deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while deleting stop",
      error: error.message,
    });
  }
};

module.exports = {
  createStop,
  getAllStops,
  getStopById,
  updateStop,
  deleteStop,
};