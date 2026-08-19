import L from "leaflet";

export const busIcon = (focused = false) =>
  new L.DivIcon({
    html: `
      <div class="bus-marker-wrap ${focused ? "focused" : ""}">
        <div class="pulse-ring"></div>
        <div class="bus-emoji">🚌</div>
      </div>
    `,
    className: "bus-marker-icon",
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });

export const stopIcon = new L.DivIcon({
  html: `
    <div class="stop-marker-wrap">
      <div class="stop-emoji">📍</div>
    </div>
  `,
  className: "stop-marker-icon",
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});
