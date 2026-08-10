// frontend/src/components/StatusBadge.jsx

const StatusBadge = ({ label, color }) => {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 600,
        color: "#fff",
        backgroundColor: color,
      }}
    >
      {label}
    </span>
  );
};

export default StatusBadge;