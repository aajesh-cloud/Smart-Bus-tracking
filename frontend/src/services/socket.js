// frontend/src/services/socket.js

import { io } from "socket.io-client";

// Create a single shared socket connection for the whole app
const socket = io(import.meta.env.VITE_SOCKET_URL, {
  autoConnect: false, // we'll manually connect when needed, not immediately on import
});

export default socket;