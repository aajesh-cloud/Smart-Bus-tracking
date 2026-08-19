import { useState, useEffect, useRef } from "react";

const Toast = ({ message, onDismiss, animationDelay = 0 }) => {
  const [closing, setClosing] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      handleClose();
    }, 6000);
    return () => clearTimeout(timerRef.current);
  }, []);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => onDismiss(), 350);
  };

  return (
    <div
      className={`toast-root ${closing ? "closing" : ""}`}
      style={{
        animationDelay: `${animationDelay}s`,
        backgroundColor: "var(--color-surface)",
        border: "1px solid rgba(34, 197, 94, 0.35)",
        borderLeft: "4px solid var(--color-success)",
        borderRadius: "12px",
        padding: "14px 18px",
        boxShadow:
          "0 16px 40px rgba(0,0,0,0.28), 0 0 0 1px var(--color-border-glass)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        minWidth: "280px",
        backdropFilter: "blur(12px)",
      }}
      role="status"
      aria-live="polite"
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span
          style={{
            fontSize: "22px",
            display: "inline-block",
            animation: "bounceIn 0.5s cubic-bezier(.2,.8,.2,1) both",
            animationDelay: `${animationDelay + 0.05}s`,
          }}
        >
          🔔
        </span>
        <span style={{ fontSize: "14px", lineHeight: 1.4 }}>{message}</span>
      </div>
      <button
        onClick={handleClose}
        style={{
          background: "none",
          border: "none",
          color: "var(--color-text-muted)",
          cursor: "pointer",
          fontSize: "18px",
          padding: "4px 8px",
          borderRadius: "6px",
          transition: "all 0.2s ease",
          lineHeight: 1,
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor =
            "var(--color-border-glass)";
          e.currentTarget.style.color = "var(--color-text)";
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "var(--color-text-muted)";
          e.currentTarget.style.transform = "scale(1)";
        }}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
