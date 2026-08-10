// backend/src/models/Bus.js

const mongoose = require("mongoose");

const busSchema = new mongoose.Schema(
  {
    busNumber: {
      type: String,
      required: [true, "Bus number is required"],
      unique: true,
      trim: true,
    },
    busType: {
      type: String,
      enum: ["college", "private"],
      default: "college",
    },
    capacity: {
      type: Number,
      default: 40,
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // must be a User whose role is "driver"
      default: null,
    },
    currentRoute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "inactive",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Bus", busSchema);