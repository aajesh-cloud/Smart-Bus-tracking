// frontend/src/components/Toast.jsx

import { useEffect } from "react";

const Toast = ({ message, onDismiss }) => {
  useEffect(() => {
    // Auto-dismiss after 6 seconds
    const timer = setTimeout(() => {
      onDismiss();
    }, 6000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      style={{
        backgroundColor: "#1e293b",
        border: "1px solid #22c55e",
        borderRadius: "10px",
        padding: "14px 18px",
        marginBottom: "10px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        minWidth: "280px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "20px" }}>🔔</span>
        <span style={{ fontSize: "14px" }}>{message}</span>
      </div>
      <button
        onClick={onDismiss}
        style={{
          background: "none",
          border: "none",
          color: "#94a3b8",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        ×
      </button>
    </div>
  );
};

export default Toast;