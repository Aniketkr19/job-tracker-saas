function StatCard({ label, value }) {

  const gradients = {
    Applied: "linear-gradient(135deg,#43A9FA,#1472DB)",
    Interview: "linear-gradient(135deg,#B27EFA,#8042DB)",
    Offers: "linear-gradient(135deg,#F2D250,#CFA524)",
    Rejected: "linear-gradient(135deg,#C43C3C,#961E1E)"
  };

  const glow = {
    Applied: "rgba(67,169,250,0.6)",
    Interview: "rgba(178,126,250,0.6)",
    Offers: "rgba(242,210,80,0.6)",
    Rejected: "rgba(196,60,60,0.6)"
  };

  return (
    <div style={{
      flex: 1,
      padding: 25,
      borderRadius: 20,
      background: gradients[label],
      boxShadow: `0 0 30px ${glow[label]}`,
      color: "white",
      position: "relative",
      transition: "0.3s"
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0px)"}
    >
      <h2 style={{ margin: 0 }}>{value}</h2>
      <p style={{ margin: 0, opacity: 0.9 }}>{label}</p>
    </div>
  );
}

export default StatCard;