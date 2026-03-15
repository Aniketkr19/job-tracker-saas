import { useState, useEffect } from "react";
import Sidebar from "../sidebar/Sidebar";
import { Menu, X } from "lucide-react";

// ============================================================
// AppLayout.jsx
//
// CHANGES:
// [CHANGE 1] Added a shared top bar that holds:
//            - Hamburger (mobile) on the left
//            - Logo (JobTracker) in the center-left
//            - Search bar + Add Job + Logout on the right
//            This replaces the old Topbar.jsx approach where
//            search/logo were on separate rows.
//
// [CHANGE 2] Main content no longer has top padding for
//            the topbar — the topbar is now fixed at the top
//            and content scrolls below it.
//
// HOW TO USE:
// In Dashboard.jsx, remove <Topbar /> and pass these props
// to AppLayout instead:
//
//   <AppLayout
//     search={search}
//     setSearch={setSearch}
//     onAddClick={() => setShowForm(true)}
//   >
//     ...your dashboard content...
//   </AppLayout>
// ============================================================

const TOPBAR_HEIGHT = 58;
const SIDEBAR_WIDTH = 260;

function AppLayout({ children, search, setSearch, onAddClick }) {
  const [open, setOpen]       = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
const [isDark, setIsDark] = useState(
  localStorage.getItem("jt_theme") !== "light"
);
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

      {/* ══════════════════════════════════════════
          FIXED TOP BAR — logo + search on same row
      ══════════════════════════════════════════ */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: TOPBAR_HEIGHT,
        background: isDark ? "#060b14" : "#ffffff",
        borderBottom: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.08)",
        display: "flex",
        alignItems: "center",
        zIndex: 250,
        paddingRight: 20,
      }}>

        {/* [LEFT] Logo — same width as sidebar so it lines up */}
        <div style={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 18px",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          height: "100%",
        }}>
          {/* Mobile hamburger inside logo area */}
          {isMobile && (
            <button
              onClick={() => setOpen(!open)}
              style={{
                background: "none", border: "none",
                cursor: "pointer", padding: 4,
                color: "white", marginRight: 4,
              }}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}

          {/* Logo icon */}
          <div style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: "linear-gradient(135deg,#22c55e,#16a34a)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 900, color: "white",
          }}>
            J
          </div>

          {/* Logo text */}
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

        {/* [RIGHT] Search + Actions */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0px 20px",
          gap: 12,
          flexWrap: "wrap",
        }}>

          {/* Search bar */}
          {setSearch && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10, padding: "7px 14px",
              minWidth: isMobile ? 140 : 240,
            }}>
              <span style={{ color: "#475569", fontSize: 15 }}>⌕</span>
              <input
                placeholder="Search roles, companies..."
                value={search || ""}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: "none", border: "none",
                  outline: "none",  color: isDark ? "#e2e8f0" : "#1e293b",
                  fontSize: 13, width: "100%",
                }}
              />
            </div>
          )}

          {/* Add Job + Logout */}
           <div style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
            {onAddClick && (
              <button
                onClick={onAddClick}
                style={{
                  padding: "8px 18px",
                  background: "linear-gradient(135deg,#22c55e,#16a34a)",
                  border: "none", borderRadius: 9,
                  color: "white", fontWeight: 700,
                  fontSize: 13, cursor: "pointer",
                }}
              >
                ＋ Add Job
              </button>
            )}
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              style={{
                padding: "8px 14px",
                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                borderRadius: 9, cursor: "pointer",
                fontSize: 16, lineHeight: 1,
                transition: "all 0.2s",
              }}
            >
              {isDark ? "☀️" : "🌙"}
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: "8px 16px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 9, color: "#f87171",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              ↪ Logout
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SIDEBAR — starts below top bar
      ══════════════════════════════════════════ */}
      <div style={{
        position: "fixed",
        left: isMobile ? (open ? 0 : -SIDEBAR_WIDTH) : 0,
        top: TOPBAR_HEIGHT,
        width: SIDEBAR_WIDTH,
        height: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
        transition: "left 0.3s",
        zIndex: 200,
        overflowY: "auto",
      }}>
        <Sidebar isDark={isDark} />
      </div>

      {/* Mobile overlay */}
      {isMobile && open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", top: 0, left: 0,
            width: "100%", height: "100%",
            background: "rgba(0,0,0,0.5)", zIndex: 150,
          }}
        />
      )}

      {/* ══════════════════════════════════════════
          MAIN CONTENT — offset by topbar + sidebar
      ══════════════════════════════════════════ */}
      <div style={{
        flex: 1,
        marginLeft: isMobile ? 0 : SIDEBAR_WIDTH,
        marginTop: TOPBAR_HEIGHT,
        padding: isMobile ? "20px 16px" : "28px 28px",
        width: "100%",
        minHeight: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
      }}>
        {children}
      </div>

    </div>
  );
}

export default AppLayout;