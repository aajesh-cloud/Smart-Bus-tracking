// frontend/src/services/mapIcons.js

import L from "leaflet";

// A custom icon for buses — using a simple emoji-based approach
// (no image files needed, works immediately)
export const busIcon = new L.DivIcon({
  html: `<div style="font-size: 28px; transform: translate(-50%, -50%);">🚌</div>`,
  className: "bus-marker-icon",
  iconSize: [30, 30],
});

// A custom icon for stops — a simple pin/dot style
export const stopIcon = new L.DivIcon({
  html: `<div style="font-size: 22px; transform: translate(-50%, -50%);">📍</div>`,
  className: "stop-marker-icon",
  iconSize: [24, 24],
});