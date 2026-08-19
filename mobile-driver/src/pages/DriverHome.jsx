import { useState, useEffect, useRef } from "react";
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
  const [shakeRoute, setShakeRoute] = useState(false);
  const startBtnRef = useRef(null);
  const stopBtnRef = useRef(null);
  const logoutBtnRef = useRef(null);

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

  const createRipple = (e, ref) => {
    if (!ref?.current) return;
    const btn = ref.current;
    const circle = document.createElement("span");
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const radius = diameter / 2;
    const rect = btn.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.className = "ripple-ink";
    const existing = btn.querySelector(".ripple-ink");
    if (existing) existing.remove();
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 650);
  };

  const handleLogout = (e) => {
    createRipple(e, logoutBtnRef);
    setTimeout(() => {
      logout();
      navigate("/login");
    }, 250);
  };

  const handleStartTrip = async (e) => {
    createRipple(e, startBtnRef);

    if (!selectedRouteId) {
      setError("Please select a route before starting the trip.");
      setShakeRoute(true);
      return;
    }

    setError("");
    setShakeRoute(false);
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

  const handleStopTrip = async (e) => {
    createRipple(e, stopBtnRef);

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
        <div className="skeleton-card fade-in-up">
          <div className="skeleton-line w-60 h-lg" />
          <div className="skeleton-line w-40" />
        </div>
        <div className="skeleton-card fade-in-up delay-1">
          <div className="skeleton-line w-40" />
          <div className="skeleton-line w-80" />
          <div className="skeleton-line w-60" />
        </div>
        <div className="skeleton-card fade-in-up delay-2">
          <div className="skeleton-line w-90 h-lg" />
          <div className="skeleton-line w-40" />
          <div className="skeleton-line w-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-page">
      <div className="mobile-card fade-in-down">
        <div className="driver-profile-card">
          <div className="driver-avatar">
            {driver?.name?.charAt(0)?.toUpperCase() || "D"}
          </div>
          <div className="driver-info">
            <h2>{driver?.name || "Driver"}</h2>
            <p>License: {driver?.licenseNumber || "Not set"}</p>
          </div>
          <div className="driver-badge bounce-in">
            <span className="driver-badge-dot" />
            Online
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message fade-in-up">{error}</div>
      )}

      {!hasBus ? (
        <div className="mobile-card warning-message assigned-bus-card fade-in-up delay-1">
          No bus is currently assigned to you. Please contact your admin.
        </div>
      ) : (
        <div className="mobile-card assigned-bus-card fade-in-up delay-1">
          <div className="assigned-bus-header">
            <span className="assigned-bus-label">Your Bus</span>
            <span className="assigned-bus-label">🚌 Assigned</span>
          </div>
          <div className="assigned-bus-number">{bus?.busNumber || "—"}</div>

          {!ongoingTrip ? (
            <div style={{ marginTop: "18px" }}>
              <div className={`form-group ${shakeRoute ? "shake" : ""}`}>
                <label>Select Route</label>
                <select
                  value={selectedRouteId}
                  onChange={(e) => {
                    setSelectedRouteId(e.target.value);
                    if (shakeRoute) setShakeRoute(false);
                    if (error) setError("");
                  }}
                  className={shakeRoute ? "has-error" : ""}
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
                className="btn-success"
                onClick={handleStartTrip}
                disabled={actionLoading}
                ref={startBtnRef}
              >
                {actionLoading ? (
                  <>
                    <span className="spinner" />
                    Starting Trip...
                  </>
                ) : (
                  <>
                    <span>▶️</span>
                    Start Trip
                  </>
                )}
              </button>
            </div>
          ) : (
            <div style={{ marginTop: "18px" }}>
              <div className="trip-status-panel trip-active fade-in-scale">
                <div className="trip-status-indicator">
                  <span className="trip-status-dot" />
                  Trip in progress
                </div>
                <div className="trip-status-row" style={{ marginTop: "10px" }}>
                  <span className="trip-status-label">Route</span>
                  <span className="trip-status-value">
                    {ongoingTrip.route.routeName} ({ongoingTrip.route.routeNumber})
                  </span>
                </div>
                <div className="trip-status-row">
                  <span className="trip-status-label">Started</span>
                  <span className="trip-status-value">
                    {new Date(ongoingTrip.startTime).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div className="gps-panel fade-in-up delay-1">
                <div className="gps-panel-title">
                  <span className="gps-panel-title-icon">📡</span>
                  GPS Tracking Status
                </div>

                {gpsStatus === "idle" && (
                  <div className="gps-status-row">
                    <div className="gps-status-icon gps-status-idle">⏳</div>
                    <div className="gps-status-text">
                      Initializing...
                      <span className="meta">Preparing location tracker</span>
                    </div>
                  </div>
                )}

                {gpsStatus === "tracking" && (
                  <div className="gps-status-row">
                    <div className="gps-status-icon gps-status-tracking">✅</div>
                    <div className="gps-status-text">
                      <span style={{ color: "#86efac", fontWeight: 600 }}>
                        Actively tracking
                      </span>
                      {lastSentAt && (
                        <span className="meta">
                          Last sent {lastSentAt.toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {gpsStatus === "error" && (
                  <div className="gps-status-row">
                    <div className="gps-status-icon gps-status-error">⚠️</div>
                    <div className="gps-status-text">
                      <span style={{ color: "#fca5a5" }}>{gpsError}</span>
                      <span className="meta">
                        Please enable location services in your browser
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <button
                className="btn-danger"
                onClick={handleStopTrip}
                disabled={actionLoading}
                ref={stopBtnRef}
              >
                {actionLoading ? (
                  <>
                    <span className="spinner" />
                    Stopping...
                  </>
                ) : (
                  <>
                    <span>⏹️</span>
                    Stop Trip
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="logout-btn-wrap fade-in-up delay-2">
        <button
          className="btn-outline"
          onClick={handleLogout}
          ref={logoutBtnRef}
        >
          <span>🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
};

export default DriverHome;
