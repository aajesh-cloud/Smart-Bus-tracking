// frontend/src/services/api.js

import axios from "axios";

// Create a pre-configured axios instance, using our .env variable
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: automatically attach the JWT token (if we have one)
// to every outgoing request, without needing to manually add it every time
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;