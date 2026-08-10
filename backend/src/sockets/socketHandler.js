// backend/src/sockets/socketHandler.js

const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    // Client tells us: "I want live updates for this specific bus"
    socket.on("joinBusRoom", (busId) => {
      const roomName = `bus-${busId}`;
      socket.join(roomName);
      console.log(`Client ${socket.id} joined room: ${roomName}`);
    });

    // Client tells us: "I no longer care about this bus"
    socket.on("leaveBusRoom", (busId) => {
      const roomName = `bus-${busId}`;
      socket.leave(roomName);
      console.log(`Client ${socket.id} left room: ${roomName}`);
    });

    // Optional: a room for admins who want to see ALL buses at once
    socket.on("joinAdminRoom", () => {
      socket.join("admin-room");
      console.log(`Client ${socket.id} joined admin-room`);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = initSocket;