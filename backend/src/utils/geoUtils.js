// backend/src/utils/geoUtils.js

// Converts degrees to radians (the Haversine formula needs radians, not degrees)
const toRadians = (degrees) => degrees * (Math.PI / 180);

// Calculates the real-world distance (in meters) between two GPS points,
// using the Haversine formula (accounts for Earth's curvature)
const calculateDistance = (coord1, coord2) => {
  // coord1 and coord2 are both [longitude, latitude] arrays (GeoJSON order)
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;

  const EARTH_RADIUS_METERS = 6371000;

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distanceMeters = EARTH_RADIUS_METERS * c;

  return distanceMeters;
};

// A sensible fallback average speed for a city bus, in meters/second
// (20 km/h ≈ 5.56 m/s) — used when the bus is stationary or speed is 0
const FALLBACK_SPEED_MPS = 5.56;

// Calculates ETA in seconds, given distance and current speed
const calculateETA = (distanceMeters, speedMps) => {
  const effectiveSpeed = speedMps && speedMps > 0.5 ? speedMps : FALLBACK_SPEED_MPS;
  const etaSeconds = distanceMeters / effectiveSpeed;
  return Math.round(etaSeconds);
};

// Converts seconds into a friendly "Xm Ys" or "Xh Ym" style string
const formatETA = (etaSeconds) => {
  if (etaSeconds < 60) {
    return `${etaSeconds}s`;
  }
  const minutes = Math.floor(etaSeconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

module.exports = { calculateDistance, calculateETA, formatETA };