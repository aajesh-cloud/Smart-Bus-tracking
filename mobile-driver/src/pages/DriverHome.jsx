// mobile-driver/src/pages/DriverHome.jsx

import { useState, useEffect } from "react";
import { useDriverAuth } from "../context/DriverAuthContext";
import { useNavigate } from "react-router-dom";
import {
  getMyTripStatus,
  getAllRoutes,
  startTrip,
  stopTrip,
} from "../services/tripService";
import { useGpsTracking } from "../hooks/useGpsTracking";

const DriverHome = () => {
  const { driver, logout } = useDriverAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [hasBus, setHasBus] = useState(false);
  const [bus, setBus] = useState(null);
  const [ongoingTrip, setOngoingTrip] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Pass the ongoing trip's ID (or null) — GPS tracking automatically
  // starts/stops in sync with this value changing
  const { gpsStatus, gpsError, lastSentAt } = useGpsTracking(
    ongoingTrip?._id || null
  );

  useEffect(() => {
    const loadInitialState = async () => {
      try {
        const [statusData, routesData] = await Promise.all([
          getMyTripStatus(),
          getAllRoutes(),
        ]);

        setHasBus(statusData.hasBus);
        setBus(statusData.bus || null);
        setOngoingTrip(statusData.ongoingTrip);
        setRoutes(routesData);

        if (statusData.ongoingTrip) {
          setSelectedRouteId(statusData.ongoingTrip.route._id);
        }
      } catch (err) {
        setError("Failed to load your trip status. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialState();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleStartTrip = async () => {
    if (!selectedRouteId) {
      setError("Please select a route before starting the trip.");
      return;
    }

    setError("");
    setActionLoading(true);

    try {
      const trip = await startTrip(bus._id, selectedRouteId);
      setOngoingTrip(trip);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start trip");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStopTrip = async () => {
    const confirmed = window.confirm("Are you sure you want to end this trip?");
    if (!confirmed) return;

    setError("");
    setActionLoading(true);

    try {
      await stopTrip(ongoingTrip._id);
      setOngoingTrip(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to stop trip");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mobile-page">
        <p style={{ color: "#94a3b8" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="mobile-page">
      <div className="mobile-card" style={{ marginBottom: "16px" }}>
        <h2>Welcome, {driver?.name}</h2>
        <p style={{ color: "#94a3b8", marginTop: "6px", fontSize: "14px" }}>
          License: {driver?.licenseNumber || "Not set"}
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!hasBus ? (
        <div className="mobile-card">
          <p style={{ color: "#f59e0b" }}>
            ⚠️ No bus is currently assigned to you. Please contact your admin.
          </p>
        </div>
      ) : (
        <div className="mobile-card">
          <p style={{ marginBottom: "16px" }}>
            <strong>Your Bus:</strong> {bus.busNumber}
          </p>

          {!ongoingTrip ? (
            <>
              <div className="form-group">
                <label>Select Route</label>
                <select
                  value={selectedRouteId}
                  onChange={(e) => setSelectedRouteId(e.target.value)}
                >
                  <option value="">— Choose a route —</option>
                  {routes.map((route) => (
                    <option key={route._id} value={route._id}>
                      {route.routeName} ({route.routeNumber})
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="btn-primary"
                onClick={handleStartTrip}
                disabled={actionLoading}
              >
                {actionLoading ? "Starting..." : "▶️ Start Trip"}
              </button>
            </>
          ) : (
            <>
              <div
                style={{
                  backgroundColor: "#0f172a",
                  borderRadius: "10px",
                  padding: "16px",
                  marginBottom: "16px",
                }}
              >
                <p style={{ color: "#22c55e", fontWeight: 600, marginBottom: "8px" }}>
                  🟢 Trip in progress
                </p>
                <p style={{ fontSize: "14px", color: "#94a3b8" }}>
                  Route: {ongoingTrip.route.routeName} ({ongoingTrip.route.routeNumber})
                </p>
                <p style={{ fontSize: "14px", color: "#94a3b8" }}>
                  Started: {new Date(ongoingTrip.startTime).toLocaleTimeString()}
                </p>
              </div>

              {/* NEW: GPS status panel */}
              <div
                style={{
                  backgroundColor: "#0f172a",
                  borderRadius: "10px",
                  padding: "16px",
                  marginBottom: "16px",
                }}
              >
                <p style={{ fontWeight: 600, marginBottom: "8px" }}>📡 GPS Status</p>

                {gpsStatus === "idle" && (
                  <p style={{ fontSize: "14px", color: "#94a3b8" }}>Initializing...</p>
                )}

                {gpsStatus === "tracking" && (
                  <p style={{ fontSize: "14px", color: "#22c55e" }}>
                    ✅ Actively tracking
                    {lastSentAt && (
                      <span style={{ color: "#94a3b8" }}>
                        {" "}
                        — last sent {lastSentAt.toLocaleTimeString()}
                      </span>
                    )}
                  </p>
                )}

                {gpsStatus === "error" && (
                  <p style={{ fontSize: "14px", color: "#ef4444" }}>⚠️ {gpsError}</p>
                )}
              </div>

              <button
                className="btn-primary btn-danger"
                onClick={handleStopTrip}
                disabled={actionLoading}
              >
                {actionLoading ? "Stopping..." : "⏹️ Stop Trip"}
              </button>
            </>
          )}
        </div>
      )}

      <button
        className="btn-primary"
        style={{ backgroundColor: "transparent", border: "1px solid #334155", marginTop: "16px" }}
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
};

export default DriverHome;