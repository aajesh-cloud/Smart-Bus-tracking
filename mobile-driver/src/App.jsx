// mobile-driver/src/App.jsx

import { Routes, Route, Navigate } from "react-router-dom";
import DriverLogin from "./pages/DriverLogin";
import DriverHome from "./pages/DriverHome";
import { useDriverAuth } from "./context/DriverAuthContext";

function App() {
  const { driver, loading } = useDriverAuth();

  if (loading) {
    return <div style={{ padding: "40px", color: "#f1f5f9" }}>Loading...</div>;
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