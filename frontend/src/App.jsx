import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminBuses from "./pages/admin/AdminBuses";
import AdminRoutes from "./pages/admin/AdminRoutes";
import AdminStops from "./pages/admin/AdminStops";
import AdminDrivers from "./pages/admin/AdminDrivers";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

const AppLoader = () => (
  <div className="app-loader">
    <div className="loader-bars" aria-hidden="true">
      <span /><span /><span /><span /><span />
    </div>
    <div className="loader-title">
      <span style={{ display: "inline-block", animation: "floatSoft 2.5s ease-in-out infinite" }}>🚌</span>
      Smart Bus Tracking
    </div>
    <div className="loader-sub">Loading your experience</div>
  </div>
);

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <AppLoader />;
  }

  return (
    <div className="app-shell fade-in" style={{ minHeight: "100vh" }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="buses" element={<AdminBuses />} />
          <Route path="routes" element={<AdminRoutes />} />
          <Route path="stops" element={<AdminStops />} />
          <Route path="drivers" element={<AdminDrivers />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
