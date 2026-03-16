import { useState, useEffect } from "react";
import Sidebar from "../sidebar/Sidebar";
import { Menu, X } from "lucide-react";

const TOPBAR_HEIGHT = 58;
const SIDEBAR_WIDTH = 260;

function AppLayout({ children, search, setSearch, onAddClick }) {
  const [open, setOpen]         = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isDark, setIsDark]     = useState(localStorage.getItem("jt_theme") !== "light");

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("jt_theme", next ? "dark" : "light");
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: isDark ? "#060b14" : "#f0f4f8" }}>

      {/* ── FIXED TOP BAR ── */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0,
        height: TOPBAR_HEIGHT,
        background: isDark ? "#060b14" : "#ffffff",
        borderBottom: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.08)",
        display: "flex", alignItems: "center",
        zIndex: 250, paddingRight: 12,
      }}>

        {/* LEFT: Logo area */}
        <div style={{
          width: isMobile ? "auto" : SIDEBAR_WIDTH,
          flexShrink: 0,
          display: "flex", alignItems: "center", gap: 10,
          padding: "0 14px",
          borderRight: isMobile ? "none" : "1px solid rgba(255,255,255,0.06)",
          height: "100%",
        }}>
          {/* Hamburger on mobile */}
          {isMobile && (
            <button onClick={() => setOpen(!open)} style={{
              background: "none", border: "none", cursor: "pointer",
              padding: 4, color: "white", marginRight: 2,
            }}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}

          {/* Logo icon */}
          <div style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: "linear-gradient(135deg,#22c55e,#16a34a)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 900, color: "white",
          }}>J</div>

          {/* Logo text — desktop only */}
          {!isMobile && (
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "white", letterSpacing: "-0.3px", lineHeight: 1 }}>
                JobTracker
              </p>
              <p style={{ margin: 0, fontSize: 9, color: "#4ade80", fontWeight: 700, letterSpacing: "0.08em" }}>
                PRO
              </p>
            </div>
          )}
        </div>

        {/* RIGHT: Search + Actions */}
        <div style={{
          flex: 1, display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "0 8px" : "0 20px",
          gap: 8, overflow: "hidden",
        }}>

          {/* Search bar */}
          {setSearch && (
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10, padding: "6px 12px",
              flex: 1, minWidth: 0, maxWidth: isMobile ? 160 : 300,
            }}>
              <span style={{ color: "#475569", fontSize: 14, flexShrink: 0 }}>⌕</span>
              <input
                placeholder={isMobile ? "Search..." : "Search roles, companies..."}
                value={search || ""}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: "none", border: "none", outline: "none",
                  color: isDark ? "#e2e8f0" : "#1e293b",
                  fontSize: 13, width: "100%", minWidth: 0,
                }}
              />
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            {onAddClick && (
              <button onClick={onAddClick} style={{
                padding: isMobile ? "7px 12px" : "8px 18px",
                background: "linear-gradient(135deg,#22c55e,#16a34a)",
                border: "none", borderRadius: 9,
                color: "white", fontWeight: 700,
                fontSize: 13, cursor: "pointer",
                whiteSpace: "nowrap",
              }}>
                {isMobile ? "＋" : "＋ Add Job"}
              </button>
            )}

            <button onClick={toggleTheme} style={{
              padding: "7px 10px",
              background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
              border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
              borderRadius: 9, cursor: "pointer",
              fontSize: 15, lineHeight: 1,
            }}>
              {isDark ? "☀️" : "🌙"}
            </button>

            <button onClick={handleLogout} style={{
              padding: isMobile ? "7px 10px" : "7px 14px",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 9, color: "#f87171",
              fontSize: isMobile ? 15 : 13, fontWeight: 600, cursor: "pointer",
            }}>
              {isMobile ? "↪" : "↪ Logout"}
            </button>
          </div>
        </div>
      </div>

      {/* ── SIDEBAR ── */}
      <div style={{
        position: "fixed",
        left: isMobile ? (open ? 0 : -SIDEBAR_WIDTH) : 0,
        top: TOPBAR_HEIGHT,
        width: SIDEBAR_WIDTH,
        height: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
        transition: "left 0.3s",
        zIndex: 200, overflowY: "auto",
      }}>
        <Sidebar isDark={isDark} />
      </div>

      {/* Mobile overlay */}
      {isMobile && open && (
        <div onClick={() => setOpen(false)} style={{
          position: "fixed", top: 0, left: 0,
          width: "100%", height: "100%",
          background: "rgba(0,0,0,0.5)", zIndex: 150,
        }} />
      )}

      {/* ── MAIN CONTENT ── */}
      <div style={{
        flex: 1,
        marginLeft: isMobile ? 0 : SIDEBAR_WIDTH,
        marginTop: TOPBAR_HEIGHT,
        padding: isMobile ? "16px 12px" : "28px 28px",
        width: "100%",
        minHeight: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
        boxSizing: "border-box",
      }}>
        {children}
      </div>

    </div>
  );
}

export default AppLayout;