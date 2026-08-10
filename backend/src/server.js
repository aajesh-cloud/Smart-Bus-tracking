// backend/src/server.js

require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const stopRoutes = require("./routes/stopRoutes");
const routeRoutes = require("./routes/routeRoutes");
const busRoutes = require("./routes/busRoutes");
const tripRoutes = require("./routes/tripRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const initSocket = require("./sockets/socketHandler");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Smart Bus Tracking backend is running!",
    status: "success",
  });
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "API test route working correctly",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/stops", stopRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/buses", busRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/notifications", notificationRoutes);

// Create a raw HTTP server, wrapping our Express app inside it
const httpServer = http.createServer(app);

// Attach Socket.IO to that same HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: "*", // allow any frontend to connect for now — we'll restrict this at deployment
  },
});

// Set up all our socket event handling logic (defined in a separate file)
initSocket(io);

// IMPORTANT: make `io` accessible from our controllers,
// so tripController.js can broadcast events after a location update
app.set("io", io);

const PORT = process.env.PORT || 5000;

// Notice: we now call listen() on httpServer, NOT app
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});