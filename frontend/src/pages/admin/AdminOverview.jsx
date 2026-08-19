import { useState, useEffect, useRef } from "react";
import api from "../../services/api";

const useCountUp = (target, duration = 800, start = true) => {
  const [value, setValue] = useState(0);
  const ref = useRef({ start: null });

  useEffect(() => {
    if (!start) return;
    ref.current.start = null;
    const step = (ts) => {
      if (ref.current.start === null) ref.current.start = ts;
      const progress = Math.min((ts - ref.current.start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);

  return value;
};

const StatCard = ({ label, value, icon, delay = 0 }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  const displayed = useCountUp(value, 900 + delay * 150, visible);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      ref={ref}
      className="stat-card glass-card hover-lift fade-in-up"
      style={{
        padding: "24px",
        flex: 1,
        minWidth: "160px",
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="stat-icon" style={{ fontSize: "28px", marginBottom: "8px" }}>
        {icon}
      </div>
      <div
        className="stat-value count-pop"
        style={{
          fontSize: "30px",
          fontWeight: 700,
          letterSpacing: "-0.5px",
          animationDelay: `${delay + 200}ms`,
          color: "var(--color-primary)",
        }}
      >
        {displayed}
      </div>
      <div style={{ color: "var(--color-text-muted)", fontSize: "14px", marginTop: "2px" }}>
        {label}
      </div>
    </div>
  );
};

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalBuses: 0,
    activeBuses: 0,
    totalRoutes: 0,
    totalStops: 0,
    totalDrivers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [busesRes, routesRes, stopsRes] = await Promise.all([
          api.get("/buses"),
          api.get("/routes"),
          api.get("/stops"),
        ]);

        const buses = busesRes.data.buses;
        const activeBuses = buses.filter((b) => b.status === "active").length;
        const driversAssigned = new Set(
          buses
            .filter((b) => b.assignedDriver)
            .map((b) => b.assignedDriver._id)
        );

        setStats({
          totalBuses: buses.length,
          activeBuses,
          totalRoutes: routesRes.data.routes.length,
          totalStops: stopsRes.data.stops.length,
          totalDrivers: driversAssigned.size,
        });
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="skeleton fade-in" style={{ height: "30px", width: "260px", marginBottom: "24px" }} />
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="skeleton fade-in-up"
              style={{
                height: "110px",
                flex: 1,
                minWidth: "160px",
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>
        <div className="skeleton fade-in" style={{ height: "120px", borderRadius: "12px" }} />
      </div>
    );
  }

  return (
    <div>
      <h1
        style={{ marginBottom: "24px", fontSize: "26px" }}
        className="fade-in-down"
      >
        Dashboard Overview
      </h1>

      <div
        style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}
      >
        <StatCard label="Total Buses" value={stats.totalBuses} icon="🚌" delay={0} />
        <StatCard label="Active Now" value={stats.activeBuses} icon="🟢" delay={80} />
        <StatCard label="Routes" value={stats.totalRoutes} icon="🛣️" delay={160} />
        <StatCard label="Stops" value={stats.totalStops} icon="📍" delay={240} />
        <StatCard label="Drivers" value={stats.totalDrivers} icon="🧑‍✈️" delay={320} />
      </div>

      <div
        className="glass-card fade-in-up delay-5"
        style={{
          padding: "24px",
          color: "var(--color-text-muted)",
          lineHeight: 1.7,
        }}
      >
        <h3
          style={{
            color: "var(--color-text)",
            marginBottom: "12px",
            fontSize: "18px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ animation: "floatSoft 2.5s ease-in-out infinite" }}>✨</span>
          Quick Start Guide
        </h3>
        <ol style={{ paddingLeft: "22px", fontSize: "14px" }}>
          <li>Go to <strong style={{ color: "var(--color-text)" }}>📍 Stops</strong> and add all your bus stops with GPS coordinates.</li>
          <li>Navigate to <strong style={{ color: "var(--color-text)" }}>🛣️ Routes</strong> to create a route and order the stops.</li>
          <li>Add drivers from <strong style={{ color: "var(--color-text)" }}>🧑‍✈️ Drivers</strong>.</li>
          <li>Finally, create buses in <strong style={{ color: "var(--color-text)" }}>🚌 Buses</strong>, assigning a route + driver.</li>
          <li>Drivers log in at the Driver App → start their trip → passengers see live tracking!</li>
        </ol>
      </div>
    </div>
  );
};

export default AdminOverview;
