// backend/src/models/Stop.js

const mongoose = require("mongoose");

const stopSchema = new mongoose.Schema(
  {
    stopName: {
      type: String,
      required: [true, "Stop name is required"],
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"], // GeoJSON requires this exact structure
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude] — IMPORTANT: this order, not lat/lng
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// This creates a special "geospatial index" so we can later run
// queries like "find the nearest stop to this GPS point" efficiently
stopSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Stop", stopSchema);