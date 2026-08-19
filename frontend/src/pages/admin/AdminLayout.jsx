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
    { path: "/admin", label: "📊 Overview", end: true, icon: "📊" },
    { path: "/admin/buses", label: "🚌 Buses", icon: "🚌" },
    { path: "/admin/routes", label: "🛣️ Routes", icon: "🛣️" },
    { path: "/admin/stops", label: "📍 Stops", icon: "📍" },
    { path: "/admin/drivers", label: "🧑‍✈️ Drivers", icon: "🧑‍✈️" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <aside
        className="fade-in-left"
        style={{
          width: "240px",
          backgroundColor: "var(--color-surface)",
          display: "flex",
          flexDirection: "column",
          padding: "20px 0",
          borderRight: "1px solid var(--color-border-glass)",
          flexShrink: 0,
        }}
      >
        <div
          style={{ padding: "0 20px", marginBottom: "30px" }}
          className="fade-in-down"
        >
          <strong style={{ fontSize: "18px", display: "block", marginBottom: "4px" }}>
            🚌 Admin Panel
          </strong>
          <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
            Fleet Management
          </span>
        </div>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          {navItems.map((item, idx) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `admin-nav-item fade-in-up delay-${idx + 1} ${isActive ? "active" : ""}`
              }
              style={({ isActive }) => ({
                display: "block",
                padding: "12px 20px",
                color: isActive ? "#fff" : "var(--color-text-muted)",
                backgroundColor: isActive ? undefined : "transparent",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: isActive ? 600 : 400,
                borderRadius: "8px",
                margin: "0 10px",
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: "0 20px" }} className="fade-in delay-7">
          <button
            className="btn-primary btn-outline"
            style={{ width: "100%" }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header
          className="fade-in-down"
          style={{
            padding: "16px 24px",
            backgroundColor: "var(--color-background)",
            borderBottom: "1px solid var(--color-border-glass)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: "14px" }}>
            Logged in as{" "}
            <strong style={{ color: "var(--color-primary)" }}>{user?.name}</strong>{" "}
            <span style={{ color: "var(--color-text-muted)" }}>
              ({user?.role})
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "999px",
                backgroundColor: "rgba(34, 197, 94, 0.15)",
                color: "var(--color-success)",
                fontSize: "12px",
                fontWeight: 600,
              }}
              className="pop-in"
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-success)",
                  animation: "pulseRing 1.8s ease-out infinite",
                  transformOrigin: "center",
                  display: "inline-block",
                }}
              />
              Online
            </span>
          </div>
        </header>

        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "24px",
          }}
          className="fade-in delay-2"
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
