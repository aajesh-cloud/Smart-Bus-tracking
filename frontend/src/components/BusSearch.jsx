// frontend/src/components/BusSearch.jsx

import { useState, useMemo, useEffect } from "react";
import StatusBadge from "./StatusBadge";
import { getBusDisplayStatus } from "../services/statusHelpers";
import api from "../services/api";

const BusSearch = ({ buses, routes, liveLocationsByBus, onSelectBus }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [allStops, setAllStops] = useState([]);
  const [favoriteStopId, setFavoriteStopId] = useState("");
  const [savingFavorite, setSavingFavorite] = useState(false);

  useEffect(() => {
    const fetchStopsAndFavorite = async () => {
      try {
        const [stopsRes, meRes] = await Promise.all([
          api.get("/stops"),
          api.get("/auth/me"),
        ]);
        setAllStops(stopsRes.data.stops);
        setFavoriteStopId(meRes.data.user.favoriteStop || "");
      } catch (error) {
        console.error("Failed to fetch stops/favorite:", error);
      }
    };
    fetchStopsAndFavorite();
  }, []);

  const handleFavoriteChange = async (e) => {
    const stopId = e.target.value;
    setFavoriteStopId(stopId);
    setSavingFavorite(true);
    try {
      await api.put("/notifications/favorite-stop", { stopId: stopId || null });
    } catch (error) {
      console.error("Failed to save favorite stop:", error);
    } finally {
      setSavingFavorite(false);
    }
  };

  const filteredBuses = useMemo(() => {
    if (!searchTerm.trim()) return buses;

    const term = searchTerm.toLowerCase();

    return buses.filter((bus) => {
      const route = routes.find((r) => r._id === bus.currentRoute?._id);

      const matchesBusNumber = bus.busNumber.toLowerCase().includes(term);
      const matchesRouteName = route?.routeName?.toLowerCase().includes(term);
      const matchesRouteNumber = route?.routeNumber?.toLowerCase().includes(term);
      const matchesDestination = route?.endPoint?.toLowerCase().includes(term);

      return (
        matchesBusNumber ||
        matchesRouteName ||
        matchesRouteNumber ||
        matchesDestination
      );
    });
  }, [searchTerm, buses, routes]);

  return (
    <div
      style={{
        width: "320px",
        backgroundColor: "#1e293b",
        padding: "16px",
        overflowY: "auto",
        height: "100%",
      }}
    >
      <div className="form-group">
        <label style={{ fontSize: "13px", color: "#94a3b8" }}>
          🔔 Notify me near this stop:
        </label>
        <select
          value={favoriteStopId}
          onChange={handleFavoriteChange}
          disabled={savingFavorite}
        >
          <option value="">— Select a stop —</option>
          {allStops.map((stop) => (
            <option key={stop._id} value={stop._id}>
              {stop.stopName}
            </option>
          ))}
        </select>
      </div>

      <input
        type="text"
        placeholder="Search bus number, route, or destination..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: "8px",
          border: "1px solid #334155",
          backgroundColor: "#0f172a",
          color: "#f1f5f9",
          marginBottom: "16px",
          fontSize: "14px",
        }}
      />

      {filteredBuses.length === 0 && (
        <p style={{ color: "#94a3b8", fontSize: "14px" }}>
          No buses match your search.
        </p>
      )}

      {filteredBuses.map((bus) => {
        const liveLocation = liveLocationsByBus[bus._id];
        const { label, color } = getBusDisplayStatus(bus, liveLocation);

        return (
          <div
            key={bus._id}
            onClick={() => onSelectBus(bus)}
            style={{
              backgroundColor: "#0f172a",
              borderRadius: "10px",
              padding: "12px 14px",
              marginBottom: "10px",
              cursor: "pointer",
              border: "1px solid #334155",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <strong>{bus.busNumber}</strong>
              <StatusBadge label={label} color={color} />
            </div>
            <div style={{ fontSize: "13px", color: "#94a3b8" }}>
              {bus.currentRoute?.routeName || "No route assigned"}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BusSearch;