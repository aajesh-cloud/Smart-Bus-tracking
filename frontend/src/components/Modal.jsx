import { useEffect, useRef } from "react";

const Modal = ({ isOpen, onClose, title, children }) => {
  const contentRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        ref={contentRef}
        className="modal-card glass-card"
        style={{
          padding: "28px",
          width: "100%",
          maxWidth: "480px",
          maxHeight: "85vh",
          overflowY: "auto",
          transformOrigin: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ animation: "floatSoft 2.5s ease-in-out infinite" }}>
              ✦
            </span>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-text-muted)",
              fontSize: "24px",
              cursor: "pointer",
              lineHeight: 1,
              width: "34px",
              height: "34px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-border-glass)";
              e.currentTarget.style.color = "var(--color-text)";
              e.currentTarget.style.transform = "rotate(90deg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--color-text-muted)";
              e.currentTarget.style.transform = "rotate(0deg)";
            }}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div style={{ animation: "fadeIn 0.3s ease-out 0.15s both" }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
