// frontend/src/services/statusHelpers.js

// Determines a passenger-friendly status label + color for a bus,
// based on its stored status and how recently it sent a GPS update
export const getBusDisplayStatus = (bus, liveLocation) => {
  if (bus.status === "maintenance") {
    return { label: "Cancelled", color: "#ef4444" }; // red
  }

  if (bus.status === "inactive") {
    return { label: "Not Running", color: "#94a3b8" }; // gray
  }

  // status === "active" — check how fresh the last GPS update is
  if (!liveLocation) {
    return { label: "Delayed", color: "#f59e0b" }; // amber
  }

  const lastUpdated = new Date(liveLocation.lastUpdated);
  const secondsSinceUpdate = (Date.now() - lastUpdated.getTime()) / 1000;

  if (secondsSinceUpdate > 120) {
    // No update in the last 2 minutes — likely stuck/delayed
    return { label: "Delayed", color: "#f59e0b" };
  }

  return { label: "On Time", color: "#22c55e" }; // green
};