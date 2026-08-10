// frontend/src/pages/admin/AdminOverview.jsx

import { useState, useEffect } from "react";
import api from "../../services/api";

const StatCard = ({ label, value, icon }) => (
  <div
    className="glass-card hover-lift fade-in-up"
    style={{
      padding: "24px",
      flex: 1,
    }}
  >
    <div style={{ fontSize: "28px", marginBottom: "8px" }}>{icon}</div>
    <div style={{ fontSize: "28px", fontWeight: 700 }}>{value}</div>
    <div style={{ color: "#94a3b8", fontSize: "14px" }}>{label}</div>
  </div>
);

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

        // We don't have a dedicated "get all drivers" endpoint yet,
        // so we count drivers indirectly via buses that have one assigned.
        // (We'll build a proper driver list endpoint in Step 15.)
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
    return <p style={{ color: "#94a3b8" }}>Loading dashboard stats...</p>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: "24px" }}>Dashboard Overview</h1>

      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <StatCard label="Total Buses" value={stats.totalBuses} icon="🚌" />
        <StatCard label="Active Now" value={stats.activeBuses} icon="🟢" />
        <StatCard label="Routes" value={stats.totalRoutes} icon="🛣️" />
        <StatCard label="Stops" value={stats.totalStops} icon="📍" />
        <StatCard label="Drivers" value={stats.totalDrivers} icon="🧑‍✈️" />
      </div>

      <div
        style={{
          backgroundColor: "#1e293b",
          borderRadius: "12px",
          padding: "24px",
          color: "#94a3b8",
        }}
      >
        More detailed reports and charts will be added in a later step.
      </div>
    </div>
  );
};

export default AdminOverview;