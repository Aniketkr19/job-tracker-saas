import { useState, useEffect } from "react";

function Header({ openLogin, openSignup }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      // KEY FIX: reduced padding on mobile
      padding: isMobile ? "16px 20px" : "20px 80px",
      position: "sticky",
      top: 0,
      zIndex: 100,
      backdropFilter: "blur(12px)",
      background: "rgba(2,6,23,0.7)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
    }}>

      {/* Logo */}
      <h2 style={{ fontWeight: "700", letterSpacing: "1px", fontSize: isMobile ? 16 : 20, margin: 0 }}>
        JobTracker
      </h2>

      {/* Nav + Buttons */}
      <div style={{
        display: "flex",
        gap: isMobile ? 10 : 30,
        alignItems: "center",
        color: "#cbd5f1",
      }}>
        {/* Hide nav links on mobile — only show buttons */}
        {!isMobile && (
          <>
            <span style={{ cursor: "pointer", fontSize: 14 }}>Home</span>
            <span style={{ cursor: "pointer", fontSize: 14 }}>Features</span>
            <span style={{ cursor: "pointer", fontSize: 14 }}>Analytics</span>
          </>
        )}

        <button
          onClick={openLogin}
          style={{
            padding: isMobile ? "7px 14px" : "8px 18px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "8px",
            color: "white",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Login
        </button>

        <button
          onClick={openSignup}
          style={{
            padding: isMobile ? "7px 14px" : "8px 20px",
            background: "linear-gradient(135deg,#34d399,#22c55e)",
            border: "none",
            borderRadius: "8px",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}

export default Header;