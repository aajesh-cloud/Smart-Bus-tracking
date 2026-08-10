// frontend/src/services/geoHelpers.js

// Converts our backend's GeoJSON [longitude, latitude] format
// into Leaflet's expected [latitude, longitude] format
export const toLeafletCoords = (geoJsonCoordinates) => {
  const [longitude, latitude] = geoJsonCoordinates;
  return [latitude, longitude];
};