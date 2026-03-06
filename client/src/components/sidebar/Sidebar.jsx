import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div style={{
  width: 260,
  height: "100vh",

  position: "fixed",        // ✅ NEW
  top: 0,                   // ✅ NEW
  left: 0,   
                 // ✅ NEW

  padding: 30,
  background: "rgba(37,40,49,1)",
  borderRight: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(20px)",
  
  boxShadow: "inset -1px 0 0 rgba(255,255,255,0.05)",
  color: "white"
}}>

      {/* Logo */}
      <h2 style={{
        marginBottom: 40,
        fontWeight: 700,
        letterSpacing: 1
      }}>
        JobTracker
      </h2>

      {/* Navigation */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 18 }}>

        {[
          { name: "Dashboard", path: "/dashboard" },
          { name: "Applications", path: "/applications" },
          { name: "Notes", path: "/notes" },
          { name: "Calendar", path: "/calendar" },
          { name: "Settings", path: "/settings" },
          { name: "Profile", path: "/profile" },
          { name: "Analytics", path: "/analytics" }
        ].map((item) => (

          <NavLink
            key={item.name}
            to={item.path}
            style={({ isActive }) => ({

              /* 🔹 UPDATED — modern padding */
              padding: "12px 18px",
              borderRadius: 14,

              fontWeight: 500,
              transition: "all 0.3s ease",
              textDecoration: "none",

              /* 🔹 UPDATED — active glow */
              background: isActive
                ? "linear-gradient(135deg, rgba(111,230,151,1), rgba(62,191,107,1))"
                : "transparent",

              color: "white",

              /* 🔹 UPDATED — stronger glow */
             boxShadow: isActive
              ? "0 0 20px rgba(111,230,151,0.4)"
              : "none",
            })}
          >
            {item.name}
          </NavLink>

        ))}

      </nav>
    </div>
  );
}

export default Sidebar;