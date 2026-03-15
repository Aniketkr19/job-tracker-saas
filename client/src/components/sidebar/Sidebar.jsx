import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  FolderOpen,
  Calendar,
  BarChart3,
  Settings,
  User,
} from "lucide-react";



// ============================================================
// Sidebar.jsx
//
// CHANGES:
// [CHANGE 1] Removed logo block — logo is now in AppLayout
//            topbar so it sits on the same line as search bar.
//
// [CHANGE 2] Removed onMouseEnter/onMouseLeave JS handlers
//            that were fighting with React Router's isActive.
//            Now ONLY isActive controls the active style —
//            this fixes the highlight disappearing bug.
//
// [CHANGE 3] Hover effect is now done with CSS :hover via a
//            a wrapper style tag — no JS needed, no conflict.
//
// [CHANGE 4] User card moved to bottom with email display.
//            Reads avatarUrl, userName, userEmail from
//            localStorage and syncs on storage events.
// ============================================================

function Sidebar({ isDark = true }) {

  const [avatarUrl, setAvatarUrl] = useState(localStorage.getItem("avatarUrl") || null);
  const [userName, setUserName]   = useState(localStorage.getItem("userName") || "");
  const [userEmail, setUserEmail] = useState(localStorage.getItem("userEmail") || "");

  useEffect(() => {
    const sync = () => {
      setAvatarUrl(localStorage.getItem("avatarUrl") || null);
      setUserName(localStorage.getItem("userName") || "");
      setUserEmail(localStorage.getItem("userEmail") || "");
    };
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const getInitials = (name = "") =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  const menu = [
    { name: "Dashboard",    path: "/dashboard",    icon: <LayoutDashboard size={17} /> },
    { name: "Applications", path: "/applications", icon: <Briefcase size={17} />       },
    { name: "Documents",    path: "/documents",    icon: <FolderOpen size={17} />      }, // ← ADD THIS
    { name: "Notes",        path: "/notes",        icon: <FileText size={17} />         },
    { name: "Calendar",     path: "/calendar",     icon: <Calendar size={17} />         },
    { name: "Analytics",    path: "/analytics",    icon: <BarChart3 size={17} />        },
  ];

  const bottomMenu = [
    { name: "Settings", path: "/settings", icon: <Settings size={17} /> },
    { name: "Profile",  path: "/profile",  icon: <User size={17} />     },
  ];

  // [CHANGE 2] isActive is the ONLY thing controlling styles
  // No onMouseEnter/onMouseLeave — they caused the bug
  const navStyle = (isActive) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 12px",
    borderRadius: 9,
    textDecoration: "none",
    fontSize: 13,
    fontWeight: isActive ? 700 : 500,
    color: isActive ? "#052e16" : "#64748b",
    background: isActive ? "#22c55e" : "transparent",
    transition: "background 0.15s, color 0.15s",
    // [CHANGE 3] CSS hover handled by className below
  });

  return (
    <>
      {/* Hover styles via a real <style> tag — no JS conflicts */}
      <style>{`
        .nav-item:hover { background: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} !important; color: ${isDark ? "#e2e8f0" : "#1e293b"} !important; }
        .nav-item.active-link:hover { background: #22c55e !important; color: #052e16 !important; }
        .sidebar-wrap { background: ${isDark ? "#0d1525" : "#ffffff"}; height: 100%; display: flex; flex-direction: column; border-right: 1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}; }
      `}</style>

      <div className="sidebar-wrap">

        {/* ── Section label: Main ── */}
        <p style={{ fontSize: 9, fontWeight: 700, color: "#1e3a5f", textTransform: "uppercase", letterSpacing: "0.1em", padding: "18px 16px 6px" }}>
          Main
        </p>

        {/* ── Main nav ── */}
        <nav style={{ padding: "0 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {menu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              // [CHANGE 2] isActive from React Router — this is the fix
              className={({ isActive }) => `nav-item${isActive ? " active-link" : ""}`}
              style={({ isActive }) => navStyle(isActive)}
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* ── Section label: Account ── */}
        <p style={{ fontSize: 9, fontWeight: 700, color: "#1e3a5f", textTransform: "uppercase", letterSpacing: "0.1em", padding: "18px 16px 6px" }}>
          Account
        </p>

        {/* ── Bottom nav ── */}
        <nav style={{ padding: "0 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {bottomMenu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `nav-item${isActive ? " active-link" : ""}`}
              style={({ isActive }) => navStyle(isActive)}
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* ── Divider ── */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "0 12px" }} />

        {/* ── [CHANGE 4] User card at bottom ── */}
        <div style={{
          margin: 10,
          padding: "12px 14px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          {/* Avatar */}
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "#1d4ed8", overflow: "hidden",
            flexShrink: 0, display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "#bfdbfe",
            border: "2px solid rgba(255,255,255,0.08)",
          }}>
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : getInitials(userName)
            }
          </div>

          {/* Name + email */}
          <div style={{ overflow: "hidden", flex: 1 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {userName || "User"}
            </p>
            <p style={{ margin: 0, fontSize: 10, color: "#475569", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {userEmail || "Online"}
            </p>
          </div>

          {/* Online dot */}
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", flexShrink: 0, boxShadow: "0 0 6px #22c55e" }} />
        </div>

      </div>
    </>
  );
}

export default Sidebar;