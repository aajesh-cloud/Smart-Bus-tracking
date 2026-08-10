// frontend/src/pages/admin/AdminLayout.jsx

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/admin", label: "📊 Overview", end: true },
    { path: "/admin/buses", label: "🚌 Buses" },
    { path: "/admin/routes", label: "🛣️ Routes" },
    { path: "/admin/stops", label: "📍 Stops" },
    { path: "/admin/drivers", label: "🧑‍✈️ Drivers" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "240px",
          backgroundColor: "#1e293b",
          display: "flex",
          flexDirection: "column",
          padding: "20px 0",
        }}
      >
        <div style={{ padding: "0 20px", marginBottom: "30px" }}>
          <strong style={{ fontSize: "18px" }}>🚌 Admin Panel</strong>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              style={({ isActive }) => ({
                display: "block",
                padding: "12px 20px",
                color: isActive ? "#fff" : "#94a3b8",
                backgroundColor: isActive ? "#2563eb" : "transparent",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: isActive ? 600 : 400,
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: "0 20px" }}>
          <button
            className="btn-primary"
            style={{ width: "100%" }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div
          style={{
            padding: "16px 24px",
            backgroundColor: "#0f172a",
            borderBottom: "1px solid #1e293b",
          }}
        >
          Logged in as <strong>{user?.name}</strong> ({user?.role})
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
          {/* Outlet renders whichever admin sub-page matches the current URL */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;