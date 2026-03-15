function StatusBadge({ status }) {

  const colors = {
    Applied: "#3b82f6",
    Interview: "#f59e0b",
    Offer: "#22c55e",
    Rejected: "#ef4444"
  };

  const color = colors[status] || "#6b7280";

  return (
    <span
      style={{
        background: `${color}20`,
        color: color,
        padding: "6px 14px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        border: `1px solid ${color}40`,
        display: "inline-block"
      }}
    >
      {status}
    </span>
  );
}

export default StatusBadge;