// frontend/src/components/ProtectedRoute.jsx

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// allowedRoles: an array like ["admin"] or ["admin", "driver"]
// If omitted, any logged-in user (regardless of role) is allowed through
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // Still checking localStorage/verifying token — don't redirect yet,
  // or we'd incorrectly kick out a genuinely logged-in user during this brief check
  if (loading) {
    return <div style={{ padding: "40px", color: "#f1f5f9" }}>Loading...</div>;
  }

  // Not logged in at all
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in, but wrong role for this specific page
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;