// backend/src/models/LiveLocation.js

const mongoose = require("mongoose");

const liveLocationSchema = new mongoose.Schema(
  {
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: true,
      unique: true, // one LiveLocation document PER bus, always overwritten
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    speed: {
      type: Number, // meters per second, optional — browser Geolocation can provide this
      default: 0,
    },
    heading: {
      type: Number, // direction in degrees (0-360), optional
      default: null,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

liveLocationSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("LiveLocation", liveLocationSchema);