// frontend/src/pages/Dashboard.jsx

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import socket from "../services/socket";
import LiveMap from "../components/LiveMap";
import BusSearch from "../components/BusSearch";
import NotificationBell from "../components/NotificationBell";
import Toast from "../components/Toast";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [liveLocationsByBus, setLiveLocationsByBus] = useState({});
  const [focusedBusId, setFocusedBusId] = useState(null);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [routesRes, busesRes] = await Promise.all([
          api.get("/routes"),
          api.get("/buses"),
        ]);
        setRoutes(routesRes.data.routes);
        setBuses(busesRes.data.buses);

        if (routesRes.data.routes.length > 0) {
          setSelectedRouteId(routesRes.data.routes[0]._id);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchLiveLocations = async () => {
      try {
        const response = await api.get("/trips/live-locations");
        const byBus = {};
        response.data.liveLocations.forEach((loc) => {
          if (loc.bus) {
            byBus[loc.bus._id] = loc;
          }
        });
        setLiveLocationsByBus(byBus);
      } catch (error) {
        console.error("Failed to fetch live locations:", error);
      }
    };

    fetchLiveLocations();

    socket.connect();
    socket.emit("joinAdminRoom");

    socket.on("locationUpdate", (data) => {
      setLiveLocationsByBus((prev) => ({
        ...prev,
        [data.busId]: {
          ...prev[data.busId],
          lastUpdated: data.lastUpdated,
          location: { coordinates: [data.longitude, data.latitude] },
        },
      }));
    });

    socket.on("tripStopped", (data) => {
      setLiveLocationsByBus((prev) => {
        const updated = { ...prev };
        delete updated[data.busId];
        return updated;
      });
    });

    // NEW: listen for near-stop alerts and show a toast for each
    socket.on("busNearStop", (data) => {
      const toastId = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id: toastId, message: data.message }]);
    });

    return () => {
      socket.off("locationUpdate");
      socket.off("tripStopped");
      socket.off("busNearStop");
      socket.disconnect();
    };
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSelectBus = (bus) => {
    setFocusedBusId(bus._id);
    if (bus.currentRoute?._id && bus.currentRoute._id !== selectedRouteId) {
      setSelectedRouteId(bus.currentRoute._id);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          backgroundColor: "#1e293b",
        }}
      >
        <div>
          <strong>🚌 Smart Bus Tracking</strong>
          <span style={{ marginLeft: "16px", color: "#94a3b8" }}>
            Welcome, {user?.name}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <NotificationBell />
          <button
            className="btn-primary"
            style={{ width: "auto", padding: "8px 16px" }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <BusSearch
          buses={buses}
          routes={routes}
          liveLocationsByBus={liveLocationsByBus}
          onSelectBus={handleSelectBus}
        />

        <div style={{ flex: 1 }}>
          {selectedRouteId ? (
            <LiveMap routeId={selectedRouteId} focusedBusId={focusedBusId} />
          ) : (
            <div style={{ padding: "40px", color: "#94a3b8" }}>
              No routes available yet.
            </div>
          )}
        </div>
      </div>

      {/* Toast container — fixed position, stacks toasts vertically */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 2000,
        }}
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            onDismiss={() => dismissToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;