// backend/src/controllers/tripController.js

const Trip = require("../models/Trip");
const Bus = require("../models/Bus");
const Route = require("../models/Route");
const LiveLocation = require("../models/LiveLocation");
const Notification = require("../models/Notification");
const { calculateDistance, calculateETA, formatETA } = require("../utils/geoUtils");

// How close (in meters) a bus needs to be to a stop before we consider it "near"
const NEAR_STOP_THRESHOLD_METERS = 300;

// @route   POST /api/trips/start
// @access  Private/Driver
const startTrip = async (req, res) => {
  try {
    const { busId, routeId } = req.body;

    if (!busId || !routeId) {
      return res.status(400).json({
        success: false,
        message: "busId and routeId are required",
      });
    }

    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    if (!bus.assignedDriver || bus.assignedDriver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this bus",
      });
    }

    const existingOngoingTrip = await Trip.findOne({
      bus: busId,
      status: "ongoing",
    });
    if (existingOngoingTrip) {
      return res.status(400).json({
        success: false,
        message: "A trip is already ongoing for this bus",
      });
    }

    const trip = await Trip.create({
      bus: busId,
      driver: req.user._id,
      route: routeId,
      status: "ongoing",
    });

    bus.status = "active";
    bus.currentRoute = routeId;
    await bus.save();

    const io = req.app.get("io");
    io.to(`bus-${busId}`).emit("tripStarted", {
      tripId: trip._id,
      busId,
      routeId,
      startTime: trip.startTime,
    });
    io.to("admin-room").emit("tripStarted", {
      tripId: trip._id,
      busId,
      routeId,
      startTime: trip.startTime,
    });

    res.status(201).json({
      success: true,
      message: "Trip started successfully",
      trip,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while starting trip",
      error: error.message,
    });
  }
};

// @route   POST /api/trips/stop
// @access  Private/Driver
const stopTrip = async (req, res) => {
  try {
    const { tripId } = req.body;

    if (!tripId) {
      return res.status(400).json({
        success: false,
        message: "tripId is required",
      });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    if (trip.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to stop this trip",
      });
    }

    if (trip.status !== "ongoing") {
      return res.status(400).json({
        success: false,
        message: "This trip is not currently ongoing",
      });
    }

    trip.status = "completed";
    trip.endTime = new Date();
    await trip.save();

    const bus = await Bus.findById(trip.bus);
    if (bus) {
      bus.status = "inactive";
      await bus.save();
    }

    await LiveLocation.deleteOne({ bus: trip.bus });

    const io = req.app.get("io");
    io.to(`bus-${trip.bus}`).emit("tripStopped", {
      tripId: trip._id,
      busId: trip.bus,
      endTime: trip.endTime,
    });
    io.to("admin-room").emit("tripStopped", {
      tripId: trip._id,
      busId: trip.bus,
      endTime: trip.endTime,
    });

    res.status(200).json({
      success: true,
      message: "Trip stopped successfully",
      trip,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while stopping trip",
      error: error.message,
    });
  }
};

// @route   POST /api/trips/update-location
// @access  Private/Driver
const updateLocation = async (req, res) => {
  try {
    const { tripId, longitude, latitude, speed, heading } = req.body;

    if (!tripId || longitude === undefined || latitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "tripId, longitude, and latitude are required",
      });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    if (trip.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update location for this trip",
      });
    }

    if (trip.status !== "ongoing") {
      return res.status(400).json({
        success: false,
        message: "Cannot update location — this trip is not ongoing",
      });
    }

    const currentCoords = [longitude, latitude];

    const liveLocation = await LiveLocation.findOneAndUpdate(
      { bus: trip.bus },
      {
        bus: trip.bus,
        trip: trip._id,
        location: {
          type: "Point",
          coordinates: currentCoords,
        },
        speed: speed || 0,
        heading: heading !== undefined ? heading : null,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );

    const io = req.app.get("io");

    // Broadcast the raw location update, same as before
    io.to(`bus-${trip.bus}`).emit("locationUpdate", {
      busId: trip.bus,
      tripId: trip._id,
      longitude,
      latitude,
      speed: speed || 0,
      heading: heading !== undefined ? heading : null,
      lastUpdated: liveLocation.lastUpdated,
    });
    io.to("admin-room").emit("locationUpdate", {
      busId: trip.bus,
      tripId: trip._id,
      longitude,
      latitude,
      speed: speed || 0,
      heading: heading !== undefined ? heading : null,
      lastUpdated: liveLocation.lastUpdated,
    });

    // ---- NEW: Calculate ETA to every stop on this trip's route ----
    const route = await Route.findById(trip.route).populate("stops.stop");

    if (route && route.stops.length > 0) {
      const etaList = [];

      for (const stopEntry of route.stops) {
        const stop = stopEntry.stop;
        if (!stop || !stop.location || !stop.location.coordinates) continue;

        const distanceMeters = calculateDistance(
          currentCoords,
          stop.location.coordinates
        );
        const etaSeconds = calculateETA(distanceMeters, speed);

        etaList.push({
          stopId: stop._id,
          stopName: stop.stopName,
          order: stopEntry.order,
          distanceMeters: Math.round(distanceMeters),
          etaSeconds,
          etaFormatted: formatETA(etaSeconds),
        });

        // ---- NEW: Check if bus is NEAR this stop ----
        if (distanceMeters <= NEAR_STOP_THRESHOLD_METERS) {
          const bus = await Bus.findById(trip.bus);
          const message = `Bus ${bus.busNumber} is approaching ${stop.stopName} (~${Math.round(distanceMeters)}m away)`;

          // Save a notification record
          await Notification.create({
            bus: trip.bus,
            trip: trip._id,
            stop: stop._id,
            message,
            distanceMeters: Math.round(distanceMeters),
          });

          // Broadcast a dedicated "near stop" event, separate from the
          // regular location update, so the frontend can trigger a
          // distinct visual/sound alert for this specific case
          io.to(`bus-${trip.bus}`).emit("busNearStop", {
            busId: trip.bus,
            tripId: trip._id,
            stopId: stop._id,
            stopName: stop.stopName,
            distanceMeters: Math.round(distanceMeters),
            message,
          });
        }
      }

      // Broadcast the full ETA list for this bus, to everyone tracking it
      io.to(`bus-${trip.bus}`).emit("etaUpdate", {
        busId: trip.bus,
        tripId: trip._id,
        etaList,
      });
    }

    res.status(200).json({
      success: true,
      message: "Location updated",
      liveLocation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while updating location",
      error: error.message,
    });
  }
};

// @route   GET /api/trips/live-locations
// @access  Public
const getAllLiveLocations = async (req, res) => {
  try {
    const liveLocations = await LiveLocation.find()
      .populate("bus", "busNumber busType status")
      .populate("trip", "route status");

    res.status(200).json({
      success: true,
      count: liveLocations.length,
      liveLocations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching live locations",
      error: error.message,
    });
  }
};
// @route   GET /api/trips/my-status
// @access  Private/Driver
// Tells the driver's app whether they currently have an ongoing trip,
// and if so, which bus/route it's on — used when the app first loads
// so the UI can restore the correct state (e.g., after closing/reopening)
const getMyTripStatus = async (req, res) => {
  try {
    // Find the bus assigned to this driver
    const bus = await Bus.findOne({ assignedDriver: req.user._id });

    if (!bus) {
      return res.status(200).json({
        success: true,
        hasBus: false,
        ongoingTrip: null,
      });
    }

    const ongoingTrip = await Trip.findOne({
      bus: bus._id,
      driver: req.user._id,
      status: "ongoing",
    }).populate("route", "routeName routeNumber");

    res.status(200).json({
      success: true,
      hasBus: true,
      bus,
      ongoingTrip: ongoingTrip || null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while checking trip status",
      error: error.message,
    });
  }
};

module.exports = {
  startTrip,
  stopTrip,
  updateLocation,
  getAllLiveLocations,
  getMyTripStatus,
};