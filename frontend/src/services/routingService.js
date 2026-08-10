// frontend/src/services/routingService.js

// Uses OSRM's free public demo server to get real road-following
// coordinates between two points. No API key required.
const OSRM_BASE_URL = "https://router.project-osrm.org/route/v1/driving";

// coord1, coord2: [longitude, latitude] (GeoJSON order, matching our backend)
// Returns an array of [latitude, longitude] pairs (Leaflet order), ready to draw
export const getRoadRoute = async (coord1, coord2) => {
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;

  const url = `${OSRM_BASE_URL}/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== "Ok" || !data.routes?.length) {
      throw new Error("No route found");
    }

    // OSRM returns [lng, lat] pairs — flip each to [lat, lng] for Leaflet
    return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  } catch (error) {
    console.error("Routing failed, falling back to straight line:", error);
    // Fallback: just connect the two points directly if the API fails
    return [
      [lat1, lng1],
      [lat2, lng2],
    ];
  }
};

// Given an ORDERED array of stops (each with GeoJSON coordinates),
// fetches the road route between each consecutive pair and stitches
// them into one continuous path
export const getFullRouteLine = async (orderedStopCoordinates) => {
  if (orderedStopCoordinates.length < 2) return [];

  const segments = await Promise.all(
    orderedStopCoordinates
      .slice(0, -1)
      .map((coord, i) => getRoadRoute(coord, orderedStopCoordinates[i + 1]))
  );

  // Flatten all segments into one continuous line
  return segments.flat();
};