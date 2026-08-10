// mobile-driver/src/services/tripService.js

import api from "./api";

export const getMyTripStatus = async () => {
  const response = await api.get("/trips/my-status");
  return response.data;
};

export const getAllRoutes = async () => {
  const response = await api.get("/routes");
  return response.data.routes;
};

export const startTrip = async (busId, routeId) => {
  const response = await api.post("/trips/start", { busId, routeId });
  return response.data.trip;
};

export const stopTrip = async (tripId) => {
  const response = await api.post("/trips/stop", { tripId });
  return response.data.trip;
};