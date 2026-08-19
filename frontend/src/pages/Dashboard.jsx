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
  const [dataLoading, setDataLoading] = useState(true);

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
      } finally {
        setDataLoading(false);
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
      <header
        className="fade-in-down"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border-glass)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div>
          <strong style={{ fontSize: "16px" }}>🚌 Smart Bus Tracking</strong>
          <span
            style={{
              marginLeft: "16px",
              color: "var(--color-text-muted)",
              fontSize: "14px",
            }}
          >
            Welcome, <strong style={{ color: "var(--color-text)" }}>{user?.name}</strong>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <NotificationBell />
          <button
            className="btn-primary btn-outline"
            style={{ width: "auto", padding: "8px 16px", fontSize: "14px" }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <aside
          className="fade-in-left delay-1"
          style={{
            width: "320px",
            borderRight: "1px solid var(--color-border-glass)",
            backgroundColor: "var(--color-background)",
            overflowY: "auto",
            flexShrink: 0,
          }}
        >
          {dataLoading ? (
            <div style={{ padding: "24px", color: "var(--color-text-muted)", fontSize: "14px" }}>
              <div className="skeleton" style={{ height: "18px", width: "70%", marginBottom: "14px" }} />
              <div className="skeleton" style={{ height: "80px", marginBottom: "14px" }} />
              <div className="skeleton" style={{ height: "80px", marginBottom: "14px" }} />
              <div className="skeleton" style={{ height: "80px" }} />
            </div>
          ) : (
            <BusSearch
              buses={buses}
              routes={routes}
              liveLocationsByBus={liveLocationsByBus}
              onSelectBus={handleSelectBus}
            />
          )}
        </aside>

        <main className="fade-in-right delay-2" style={{ flex: 1, position: "relative" }}>
          {selectedRouteId ? (
            <LiveMap routeId={selectedRouteId} focusedBusId={focusedBusId} />
          ) : (
            <div
              style={{
                padding: "40px",
                color: "var(--color-text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div style={{ fontSize: "60px", animation: "floatSoft 3s ease-in-out infinite" }}>
                🛣️
              </div>
              <p className="fade-in delay-3">No routes available yet. Please contact admin.</p>
            </div>
          )}
        </main>
      </div>

      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 2000,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxWidth: "360px",
        }}
      >
        {toasts.map((toast, idx) => (
          <Toast
            key={toast.id}
            message={toast.message}
            onDismiss={() => dismissToast(toast.id)}
            animationDelay={idx * 0.05}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
