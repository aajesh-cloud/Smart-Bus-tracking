import { Routes, Route, Navigate } from "react-router-dom";
import DriverLogin from "./pages/DriverLogin";
import DriverHome from "./pages/DriverHome";
import { useDriverAuth } from "./context/DriverAuthContext";

function App() {
  const { driver, loading } = useDriverAuth();

  if (loading) {
    return (
      <div className="app-loader-wrap">
        <div className="app-loader-bars">
          <div className="app-loader-bar" />
          <div className="app-loader-bar" />
          <div className="app-loader-bar" />
          <div className="app-loader-bar" />
          <div className="app-loader-bar" />
        </div>
        <div className="app-loader-title">
          <span className="bus">🚌</span>
          Smart Bus Driver
        </div>
        <div className="app-loader-sub">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<DriverLogin />} />
      <Route
        path="/home"
        element={driver ? <DriverHome /> : <Navigate to="/login" />}
      />
      <Route path="/" element={<Navigate to={driver ? "/home" : "/login"} />} />
    </Routes>
  );
}

export default App;
