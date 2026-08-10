// backend/src/controllers/routeController.js

const Route = require("../models/Route");

// @route   POST /api/routes
// @access  Private/Admin
const createRoute = async (req, res) => {
  try {
    const { routeName, routeNumber, stops, startPoint, endPoint } = req.body;

    if (!routeName || !routeNumber) {
      return res.status(400).json({
        success: false,
        message: "routeName and routeNumber are required",
      });
    }

    const route = await Route.create({
      routeName,
      routeNumber,
      stops: stops || [], // expects: [{ stop: "<stopId>", order: 1 }, ...]
      startPoint,
      endPoint,
    });

    res.status(201).json({
      success: true,
      message: "Route created successfully",
      route,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while creating route",
      error: error.message,
    });
  }
};

// @route   GET /api/routes
// @access  Public
const getAllRoutes = async (req, res) => {
  try {
    // .populate() replaces each stop's ID reference with the FULL stop
    // document (name, coordinates), so the frontend doesn't need a
    // second request just to show stop names on a route
    const routes = await Route.find()
      .populate("stops.stop")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: routes.length,
      routes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching routes",
      error: error.message,
    });
  }
};

// @route   GET /api/routes/:id
// @access  Public
const getRouteById = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id).populate("stops.stop");

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    res.status(200).json({
      success: true,
      route,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching route",
      error: error.message,
    });
  }
};

// @route   PUT /api/routes/:id
// @access  Private/Admin
const updateRoute = async (req, res) => {
  try {
    const { routeName, routeNumber, stops, startPoint, endPoint } = req.body;

    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    if (routeName) route.routeName = routeName;
    if (routeNumber) route.routeNumber = routeNumber;
    if (stops) route.stops = stops;
    if (startPoint) route.startPoint = startPoint;
    if (endPoint) route.endPoint = endPoint;

    await route.save();

    res.status(200).json({
      success: true,
      message: "Route updated successfully",
      route,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while updating route",
      error: error.message,
    });
  }
};

// @route   DELETE /api/routes/:id
// @access  Private/Admin
const deleteRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    await route.deleteOne();

    res.status(200).json({
      success: true,
      message: "Route deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while deleting route",
      error: error.message,
    });
  }
};

module.exports = {
  createRoute,
  getAllRoutes,
  getRouteById,
  updateRoute,
  deleteRoute,
};