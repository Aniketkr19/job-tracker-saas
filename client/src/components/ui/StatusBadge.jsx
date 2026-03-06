function StatusBadge({ status }) {

  const colors = {
    Applied: "#3b82f6",
    Interview: "#f59e0b",
    Offer: "#22c55e",
    Rejected: "#ef4444"
  };

  return (
    <span style={{
      background: colors[status] || "#6b7280",
      color: "white",
      padding: "6px 14px",
      borderRadius: 20,
      fontSize: 12,
      boxShadow: `0 0 12px ${colors[status]}`,
      display: "inline-block",
      marginTop: 8
    }}>
      {status}
    </span>
  );
}

export default StatusBadge;