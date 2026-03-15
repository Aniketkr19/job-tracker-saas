// ============================================================
// Dashboard.jsx
// ============================================================
//
// QUICK NAVIGATION — search these tags to jump to a section:
//
//   #IMPORTS          — all imports at the top
//   #STATUS-BADGE     — colored pill badge (Applied/Interview/Offer/Rejected)
//   #COMPANY-LOGO     — colored letter circle next to job title
//   #JOB-CARD         — single job row with More Info panel
//   #STAT-CARD        — gradient number cards at the top of dashboard
//   #INPUT-STYLE      — shared input/textarea/select CSS object
//   #MODAL            — reusable popup wrapper (title + close button)
//   #DASHBOARD        — main Dashboard() component starts here
//   #STATE            — all useState variables
//   #FETCH-JOBS       — API call to load jobs + auto-refresh logic
//   #HANDLERS         — delete / add / update job functions
//   #STATS            — applied/interview/offer/rejected counts
//   #FILTER-SEARCH    — filter tabs + search bar logic
//   #UPCOMING         — upcoming interviews list (sorted by date)
//   #ACTIVITY         — recent activity feed (newest first)
//   #STYLES           — panelStyle, btnSave, btnCancel etc.
//   #RENDER           — return() JSX starts here
//   #STAT-CARDS-UI    — 5 stat cards rendered in a grid
//   #TWO-COLUMN       — Upcoming Interviews + Recent Activity side by side
//   #JOBS-LIST        — filter tabs + job cards list
//   #ADD-MODAL        — Add New Job modal form
//   #EDIT-MODAL       — Edit Job modal form
//
// ============================================================

// ─────────────────────────────────────────
// #IMPORTS
// ─────────────────────────────────────────
import { useEffect, useState, useCallback } from "react";
import API from "../../api/axios";
import AppLayout from "../../components/layout/AppLayout";
import StatCard from "../../components/ui/StatCard";


// ─────────────────────────────────────────
// #STATUS-BADGE
// Shows a colored pill: Applied (blue) / Interview (yellow) /
// Offer (green) / Rejected (red)
// Usage: <StatusBadge status={job.status} />
// ─────────────────────────────────────────
function StatusBadge({ status }) {
  const config = {
    Applied:   { bg: "rgba(59,130,246,0.1)",  color: "#60a5fa",  border: "rgba(59,130,246,0.2)"  },
    Interview: { bg: "rgba(245,158,11,0.1)",  color: "#fbbf24",  border: "rgba(245,158,11,0.2)"  },
    Offer:     { bg: "rgba(34,197,94,0.1)",   color: "#4ade80",  border: "rgba(34,197,94,0.2)"   },
    Rejected:  { bg: "rgba(239,68,68,0.1)",   color: "#f87171",  border: "rgba(239,68,68,0.2)"   },
  };
  const c = config[status] || config.Applied;
  return (
    <span style={{
      padding: "4px 12px", borderRadius: 20, fontSize: 11,
      fontWeight: 700, letterSpacing: "0.3px",
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
    }}>
      {status}
    </span>
  );
}


// ─────────────────────────────────────────
// #COMPANY-LOGO
// Auto-colored circle showing the first letter of the company name.
// Color is picked based on charCode so it's consistent per company.
// To add more colors: add another { bg, color } object to logoColors.
// Usage: <CompanyLogo name={job.company} />
// ─────────────────────────────────────────
const logoColors = [
  { bg: "rgba(59,130,246,0.15)",  color: "#60a5fa"  },
  { bg: "rgba(14,165,233,0.15)",  color: "#38bdf8"  },
  { bg: "rgba(34,197,94,0.15)",   color: "#4ade80"  },
  { bg: "rgba(239,68,68,0.15)",   color: "#f87171"  },
  { bg: "rgba(168,85,247,0.15)",  color: "#c084fc"  },
  { bg: "rgba(245,158,11,0.15)",  color: "#fbbf24"  },
];

function CompanyLogo({ name }) {
  const idx = name.charCodeAt(0) % logoColors.length;
  const { bg, color } = logoColors[idx];
  return (
    <div style={{
      width: 42, height: 42, borderRadius: 10, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 16, fontWeight: 800, background: bg, color,
    }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}


// ─────────────────────────────────────────
// #JOB-CARD
// Single job row. Shows: logo, title, company, location, date, badge, buttons.
// Clicking "▼ More Info" expands a panel with:
//   - 📍 location
//   - 🔗 clickable job URL (shortened to "indeed.com ↗")
//   - notes (with URL junk stripped out)
//   - job description (scrollable)
//
// Props:
//   job      — job object from API
//   onEdit   — called with job object when Edit is clicked
//   onDelete — called with job.id when Delete is clicked
// ─────────────────────────────────────────
function JobCard({ job, onEdit, onDelete }) {
  const [hovered, setHovered]   = useState(false);
  const [expanded, setExpanded] = useState(false); // controls More Info panel

  // Strip "Saved from indeed.com — https://..." that extension used to add to notes
  const cleanNotes = (job.notes || "")
    .replace(/Saved from [\w.]+ — https?:\/\/\S+/gi, "")
    .trim();

  // Only show "More Info" button if there's actually something extra to show
  const hasMoreInfo = !!(job.location || job.description || job.sourceUrl || cleanNotes);

  // Shorten URL for display: "https://in.indeed.com/job/..." → "in.indeed.com"
  function shortenUrl(url) {
    try { return new URL(url).hostname.replace("www.", ""); }
    catch { return "View Job"; }
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#111c30" : "#0d1525",
        border: `1px solid ${hovered ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)"}`,
        borderRadius: 14,
        transition: "all 0.2s",
        transform: hovered ? "translateX(4px)" : "translateX(0)",
        cursor: "default",
        overflow: "hidden", // needed so expanded panel doesn't break border-radius
      }}
    >

      {/* ── Main visible row ── */}
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>

        {/* LEFT: logo + title + company + location */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
          <CompanyLogo name={job.company} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", margin: 0,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {job.title}
            </p>
            <p style={{ fontSize: 12, color: "#38bdf8", fontWeight: 600, margin: "3px 0 0" }}>
              {job.company}
            </p>
            {/* Location shown inline — hidden if empty */}
            {job.location && (
              <p style={{ fontSize: 11, color: "#475569", margin: "3px 0 0" }}>
                📍 {job.location}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT: date + badge + buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {job.interviewDate && (
            <span style={{ fontSize: 11, color: "#334155", marginRight: 4 }}>
              📅 {job.interviewDate.split("T")[0]}
            </span>
          )}
          <StatusBadge status={job.status} />

          {/* More Info toggle — only appears if job has extra data */}
          {hasMoreInfo && (
            <button
              onClick={() => setExpanded(v => !v)}
              style={{
                padding: "5px 11px",
                background: expanded ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${expanded ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 7, color: expanded ? "#818cf8" : "#64748b",
                fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {expanded ? "▲ Less" : "▼ More Info"}
            </button>
          )}

          <button onClick={() => onEdit(job)} style={{
            padding: "5px 12px", background: "rgba(56,189,248,0.08)",
            border: "1px solid rgba(56,189,248,0.2)", borderRadius: 7,
            color: "#38bdf8", fontSize: 11, fontWeight: 700, cursor: "pointer",
          }}>Edit</button>

          <button onClick={() => onDelete(job.id)} style={{
            padding: "5px 10px", background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)", borderRadius: 7,
            color: "#f87171", fontSize: 11, fontWeight: 700, cursor: "pointer",
          }}>Delete</button>
        </div>
      </div>

      {/* ── Expandable More Info panel (hidden by default) ── */}
      {expanded && hasMoreInfo && (
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "14px 20px",
          background: "rgba(0,0,0,0.2)",
          display: "flex", flexDirection: "column", gap: 10,
        }}>

          {/* Location + clickable job link */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            {job.location && (
              <span style={{ fontSize: 13, color: "#94a3b8" }}>📍 {job.location}</span>
            )}
            {job.sourceUrl && (
              <a href={job.sourceUrl} target="_blank" rel="noreferrer" style={{
                fontSize: 12, color: "#38bdf8", fontWeight: 600, textDecoration: "none",
                padding: "4px 12px", background: "rgba(56,189,248,0.08)",
                border: "1px solid rgba(56,189,248,0.2)", borderRadius: 7,
              }}>
                🔗 {shortenUrl(job.sourceUrl)} — View Job ↗
              </a>
            )}
          </div>

          {/* Notes (cleaned) */}
          {cleanNotes && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#334155",
                textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>
                Notes
              </p>
              <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.6 }}>
                {cleanNotes}
              </p>
            </div>
          )}

          {/* Job description — scrollable if long */}
          {job.description && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#334155",
                textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>
                Job Description
              </p>
              <p style={{
                fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.7,
                maxHeight: 200, overflowY: "auto",
                padding: "10px 14px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 8, whiteSpace: "pre-wrap",
              }}>
                {job.description}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ─────────────────────────────────────────
// #STAT-CARD
// Gradient card showing a number stat.
// To add a new stat card: copy a <DashStatCard /> line in #STAT-CARDS-UI
// and pass new label/value/icon/bg/border/valueColor.
// The `trend` prop shows a small badge (e.g. "▲ Active") — omit to hide it.
// ─────────────────────────────────────────
function DashStatCard({ label, value, icon, bg, border, valueColor, trend }) {
  return (
    <div style={{
      borderRadius: 16, padding: "20px", background: bg,
      border: `1px solid ${border}`, position: "relative", overflow: "hidden",
    }}>
      {/* Decorative faded circle in top-right corner */}
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80,
        borderRadius: "50%", background: valueColor, opacity: 0.1 }} />

      <span style={{ fontSize: 22, display: "block", marginBottom: 10 }}>{icon}</span>
      <div style={{ fontSize: 32, fontWeight: 800, color: valueColor, lineHeight: 1, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.08em", opacity: 0.5, color: "#e2e8f0" }}>
        {label}
      </div>

      {/* Optional trend badge (bottom-right) */}
      {trend && (
        <span style={{ position: "absolute", bottom: 12, right: 14, fontSize: 10, fontWeight: 700,
          padding: "2px 8px", borderRadius: 6, background: `${valueColor}20`, color: valueColor }}>
          {trend}
        </span>
      )}
    </div>
  );
}


// ─────────────────────────────────────────
// #INPUT-STYLE
// Shared style object used by all inputs, selects, textareas in modals.
// To change input appearance globally, edit this one object.
// ─────────────────────────────────────────
const inputStyle = {
  width: "100%", padding: "10px 12px", borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)", background: "#111827",
  color: "white", fontSize: 14, outline: "none", boxSizing: "border-box",
};


// ─────────────────────────────────────────
// #MODAL
// Reusable popup wrapper. Renders a dark overlay + centered card.
// Props:
//   title   — heading text shown at the top
//   onClose — called when ✕ is clicked
//   children — the form content inside
// ─────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center",
      alignItems: "center", zIndex: 300, backdropFilter: "blur(4px)",
    }}>
      <div style={{
        background: "#0d1525", padding: 30, borderRadius: 18, width: 440,
        border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
        maxHeight: "90vh", overflowY: "auto", // scroll if form is too tall
      }}>
        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: "#f1f5f9" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}


// ─────────────────────────────────────────
// #DASHBOARD
// Main component. Everything below is the core app logic.
// ─────────────────────────────────────────
function Dashboard() {

  // ── #STATE ──────────────────────────────────────────────
  // To add a new field: add useState here, add to handleAddJob,
  // handleUpdateJob, the Add modal, and the Edit modal.

  const [jobs, setJobs]         = useState([]);
  const [showForm, setShowForm] = useState(false); // controls Add modal
  const [filter, setFilter] = useState(
  JSON.parse(localStorage.getItem("jt_settings") || "{}").defaultFilter || "All"); // active filter tab
  const [search, setSearch]     = useState("");    // search bar value
  const [editJob, setEditJob]   = useState(null);  // job being edited (null = modal closed)

  // Add Job form fields
  const [title, setTitle]                   = useState("");
  const [company, setCompany]               = useState("");
  const [status, setStatus]                 = useState("");
  const [notes, setNotes]                   = useState("");
  const [interviewDate, setInterviewDate]   = useState("");
  const [location, setLocation]             = useState("");     // e.g. "Mumbai" or "Remote"
  const [description, setDescription]       = useState("");     // paste from job posting
  const [sourceUrl, setSourceUrl]           = useState("");     // link to original job

  // Edit Job form fields (mirror of above, prefixed with "edit")
  const [editTitle, setEditTitle]                   = useState("");
  const [editCompany, setEditCompany]               = useState("");
  const [editStatus, setEditStatus]                 = useState("");
  const [editNotes, setEditNotes]                   = useState("");
  const [editInterviewDate, setEditInterviewDate]   = useState("");
  const [editLocation, setEditLocation]             = useState("");
  const [editDescription, setEditDescription]       = useState("");
  const [editSourceUrl, setEditSourceUrl]           = useState("");
  const settings = JSON.parse(localStorage.getItem("jt_settings") || "{}");


  // ── #FETCH-JOBS ─────────────────────────────────────────
  // Loads all jobs for the logged-in user.
  // Wrapped in useCallback so it can be used in multiple useEffects safely.
  // Auto-refreshes every 10s so jobs saved via Chrome extension appear automatically.
  // Also refreshes when the browser tab regains focus.

  const fetchJobs = useCallback(async () => {
    const token = localStorage.getItem("token");
    const res = await API.get("/jobs", { headers: { Authorization: `Bearer ${token}` } });
    setJobs(res.data);
  }, []);

  // Initial load
  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  // Poll every 10 seconds (so extension-saved jobs appear without page refresh)
  useEffect(() => {
    const id = setInterval(fetchJobs, 10000);
    return () => clearInterval(id); // cleanup on unmount
  }, [fetchJobs]);

  // Refresh instantly when user switches back to this tab from a job site
  useEffect(() => {
    window.addEventListener("focus", fetchJobs);
    return () => window.removeEventListener("focus", fetchJobs);
  }, [fetchJobs]);

  // Close modals on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") { setShowForm(false); setEditJob(null); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);


  // ── #HANDLERS ───────────────────────────────────────────
  // To add a new field to API calls: add it to the object passed to API.post/put
  // and make sure the backend jobController also reads it from req.body.

  // Delete a job by id
  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    await API.delete(`/jobs/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    setJobs(jobs.filter((j) => j.id !== id));
  };

  // Submit the Add Job form
  const handleAddJob = async () => {
    const token = localStorage.getItem("token");
    await API.post("/jobs",
      { title, company, status, notes, interviewDate, location, description, sourceUrl },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const res = await API.get("/jobs", { headers: { Authorization: `Bearer ${token}` } });
    setJobs(res.data);
    setShowForm(false);
    // Reset all add-form fields
    setTitle(""); setCompany(""); setStatus(""); setNotes(""); setInterviewDate("");
    setLocation(""); setDescription(""); setSourceUrl("");
  };

  // Submit the Edit Job form
  const handleUpdateJob = async () => {
    const token = localStorage.getItem("token");
    await API.put(`/jobs/${editJob.id}`,
      {
        title: editTitle, company: editCompany, status: editStatus,
        notes: editNotes, interviewDate: editInterviewDate,
        location: editLocation, description: editDescription, sourceUrl: editSourceUrl,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const res = await API.get("/jobs", { headers: { Authorization: `Bearer ${token}` } });
    setJobs(res.data);
    setEditJob(null);
  };


  // ── #STATS ──────────────────────────────────────────────
  // Counts shown in the stat cards at the top.
  // To add a new stat: add a new filter here and add a <DashStatCard /> in #STAT-CARDS-UI.

  const applied      = jobs.filter((j) => j.status === "Applied").length;
  const interview    = jobs.filter((j) => j.status === "Interview").length;
  const offer        = jobs.filter((j) => j.status === "Offer").length;
  const rejected     = jobs.filter((j) => j.status === "Rejected").length;
  const responseRate = applied === 0 ? 0 : Math.round((interview / applied) * 100);


  // ── #FILTER-SEARCH ──────────────────────────────────────
  // Applies the active tab filter and the search bar text.
  // Search checks both job title and company name (case-insensitive).
  // To search more fields: add more || conditions inside .filter().

  const filteredJobs = jobs
    .filter((j) => filter === "All" || j.status === filter)
    .filter((j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase())
    );


  // ── #UPCOMING ───────────────────────────────────────────
  // Jobs with status "Interview" and an interviewDate, sorted soonest first.
  // Shows max 3 cards. Change .slice(0, 3) to show more.

  const upcomingInterviews = jobs
    .filter((j) => j.status === "Interview" && j.interviewDate)
    .sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate))
    .slice(0, 3);

  // Helper: "3 days left", "Today!", "Past"
  const daysUntil = (dateStr) => {
    const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "Past";
    if (diff === 0) return "Today!";
    return `${diff} day${diff !== 1 ? "s" : ""} left`;
  };


  // ── #ACTIVITY ───────────────────────────────────────────
  // Derives a "Recent Activity" feed from the jobs list.
  // Shows newest 5 jobs. Change .slice(0, 5) to show more.
  // To change the activity text format: edit the `text` mapping below.

  const recentActivity = [...jobs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map((j) => ({
      id: j.id,
      text: j.status === "Offer"     ? `Offer received from ${j.company}`
          : j.status === "Interview" ? `Interview scheduled at ${j.company}`
          : j.status === "Rejected"  ? `Rejected by ${j.company}`
          :                            `Applied to ${j.company}`,
      company: j.company,
      status: j.status,
      time: new Date(j.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }));

  // Dot color for each status in the activity feed
  const activityDotColor = {
    Offer:     "#4ade80",
    Interview: "#fbbf24",
    Rejected:  "#f87171",
    Applied:   "#60a5fa",
  };


  // ── #STYLES ─────────────────────────────────────────────
  // Shared inline style objects used in the JSX below.
  // To restyle panels, buttons etc. — change values here.

  const panelStyle = {
    background: "#0d1525",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 18, padding: 20,
  };

  const btnPrimary = { // used by the top-bar "＋ Add Job" button
    padding: "10px 20px", background: "linear-gradient(135deg,#22c55e,#16a34a)",
    border: "none", borderRadius: 10, color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer",
  };

  const btnSave = { // green Save/Update button inside modals
    flex: 1, padding: 11, background: "#22c55e", border: "none",
    borderRadius: 8, color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer",
  };

  const btnCancel = { // grey Cancel button inside modals
    flex: 1, padding: 11, background: "#1e293b", border: "none",
    borderRadius: 8, color: "#94a3b8", fontWeight: 600, fontSize: 14, cursor: "pointer",
  };


  // ── #RENDER ─────────────────────────────────────────────
  return (
    <AppLayout
      search={search}
      setSearch={setSearch}
      onAddClick={() => setShowForm(true)}
    >
      <div style={{ padding: "0 24px 40px" }}>


        {/* ── #STAT-CARDS-UI ──────────────────────────────
            5 gradient cards: Applied, Interviews, Offers, Rejected, Response Rate.
            To add a new card: copy one line and change label/value/icon/colors.
            Colors reference: blue=#60a5fa, purple=#a78bfa, green=#4ade80, red=#f87171
      ─────────────────────────────────────────────── */}
     {settings.showStatCards !== false && (
  <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 14, marginBottom: 28,
  }}>
    <DashStatCard label="Applied"       value={applied}            icon="📨" bg="linear-gradient(135deg,#0c1a3a,#0f2050)" border="rgba(59,130,246,0.25)"  valueColor="#60a5fa" />
    <DashStatCard label="Interviews"    value={interview}          icon="🎯" bg="linear-gradient(135deg,#1a0c3a,#2d1a60)" border="rgba(139,92,246,0.25)"  valueColor="#a78bfa" trend={interview > 0 ? "▲ Active" : undefined} />
    <DashStatCard label="Offers"        value={offer}              icon="🏆" bg="linear-gradient(135deg,#0a1f14,#0f3020)" border="rgba(34,197,94,0.25)"   valueColor="#4ade80" trend={offer > 0 ? "🔥 Hot" : undefined} />
    <DashStatCard label="Rejected"      value={rejected}           icon="❌" bg="linear-gradient(135deg,#1f0a0a,#3a1010)" border="rgba(239,68,68,0.25)"   valueColor="#f87171" />
    <DashStatCard label="Response Rate" value={`${responseRate}%`} icon="📊" bg="linear-gradient(135deg,#0f1520,#1a2035)" border="rgba(148,163,184,0.15)" valueColor="#e2e8f0" />
  </div>
)}

{(settings.showUpcoming !== false || settings.showRecentActivity !== false) && (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, marginBottom: 28 }}>

    {settings.showUpcoming !== false && (
      <div style={panelStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>🗓 Upcoming Interviews</span>
          <span style={{ fontSize: 12, color: "#38bdf8", fontWeight: 600 }}>
            {upcomingInterviews.length} scheduled
          </span>
        </div>
        {upcomingInterviews.length === 0 ? (
          <p style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
            No upcoming interviews
          </p>
        ) : (
          upcomingInterviews.map((job) => (
            <div key={job.id} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "13px 14px",
              borderRadius: 12, background: "rgba(16,185,129,0.05)",
              border: "1px solid rgba(16,185,129,0.15)", marginBottom: 10,
            }}>
              <div style={{ width: 10, height: 10, background: "#10b981", borderRadius: "50%",
                flexShrink: 0, boxShadow: "0 0 8px #10b981" }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#ecfdf5", margin: 0 }}>{job.company}</p>
                <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>{job.title}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                  <span style={{ fontSize: 11, color: "#34d399", fontWeight: 600 }}>
                    📅 {job.interviewDate?.split("T")[0]}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                    background: "rgba(52,211,153,0.1)", color: "#34d399" }}>
                    {daysUntil(job.interviewDate)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    )}

    {settings.showRecentActivity !== false && (
      <div style={panelStyle}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>
          ⚡ Recent Activity
        </p>
        {recentActivity.length === 0 ? (
          <p style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
            No activity yet
          </p>
        ) : (
          recentActivity.map((item, i) => (
            <div key={item.id} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 0",
              borderBottom: i < recentActivity.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                background: activityDotColor[item.status] || "#60a5fa" }} />
              <p style={{ fontSize: 12, color: "#94a3b8", flex: 1, margin: 0, lineHeight: 1.4 }}>
                <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{item.company}</span>
                {" — "}{item.text.replace(item.company, "").trim()}
              </p>
              <span style={{ fontSize: 11, color: "#475569", flexShrink: 0 }}>{item.time}</span>
            </div>
          ))
        )}
      </div>
    )}

  </div>
)}

        {/* ── #JOBS-LIST ───────────────────────────────────
            Header row + filter tabs + job cards.
            To add a new filter tab: add a new string to the array below.
            Make sure the string matches the status value in the DB.
        ─────────────────────────────────────────────── */}

        {/* Header: "My Applications" + count badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "#f1f5f9" }}>My Applications</h3>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20,
            background: "rgba(255,255,255,0.06)", color: "#94a3b8", fontWeight: 600 }}>
            {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"}
          </span>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          {["All", "Applied", "Interview", "Offer", "Rejected"].map((tab) => (
            <button key={tab} onClick={() => setFilter(tab)} style={{
              padding: "7px 16px", borderRadius: 20, cursor: "pointer",
              border: filter === tab ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(255,255,255,0.08)",
              background: filter === tab ? "rgba(34,197,94,0.15)" : "transparent",
              color: filter === tab ? "#4ade80" : "#64748b",
              fontSize: 12, fontWeight: 600,
            }}>{tab}</button>
          ))}
        </div>

        {/* Job card list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filteredJobs.length === 0 ? (
            // Empty state
            <div style={{ textAlign: "center", padding: "40px 0", color: "#475569" }}>
              <p style={{ fontSize: 32, marginBottom: 12 }}>📭</p>
              <p style={{ fontSize: 14 }}>No jobs found. Add your first application!</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onEdit={(j) => {
                  // Populate edit form with this job's data, then open modal
                  setEditJob(j);
                  setEditTitle(j.title);
                  setEditCompany(j.company);
                  setEditStatus(j.status);
                  setEditNotes(j.notes || "");
                  setEditInterviewDate(j.interviewDate || "");
                  setEditLocation(j.location || "");
                  setEditDescription(j.description || "");
                  setEditSourceUrl(j.sourceUrl || "");
                }}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

      </div>{/* end main content wrapper */}


      {/* ── #ADD-MODAL ──────────────────────────────────────
          Add New Job form.
          To add a new field: add an <input> or <textarea> here,
          create a useState for it in #STATE,
          and include it in handleAddJob in #HANDLERS.
      ─────────────────────────────────────────────── */}
      {showForm && (
        <Modal title="＋ Add New Job" onClose={() => setShowForm(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            <input placeholder="Job Title / Role"
              value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />

            <input placeholder="Company Name"
              value={company} onChange={(e) => setCompany(e.target.value)} style={inputStyle} />

            <input placeholder="📍 Location (e.g. Mumbai, Remote, Hybrid)"
              value={location} onChange={(e) => setLocation(e.target.value)} style={inputStyle} />

            <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
              <option value="">Select Status</option>
              <option>Applied</option>
              <option>Interview</option>
              <option>Offer</option>
              <option>Rejected</option>
            </select>

            <input placeholder="🔗 Job URL (paste from Naukri, Indeed...)"
              value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} style={inputStyle} />

            <textarea placeholder="Notes (optional)"
              value={notes} onChange={(e) => setNotes(e.target.value)}
              rows={3} style={{ ...inputStyle, resize: "vertical" }} />

            <textarea placeholder="📄 Job Description (paste from job posting)"
              value={description} onChange={(e) => setDescription(e.target.value)}
              rows={4} style={{ ...inputStyle, resize: "vertical" }} />

            <div>
              <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6 }}>
                Interview Date (optional)
              </label>
              <input type="date" value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button onClick={handleAddJob} style={btnSave}>Save Job</button>
              <button onClick={() => setShowForm(false)} style={btnCancel}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}


      {/* ── #EDIT-MODAL ─────────────────────────────────────
          Edit Job form — mirrors the Add form but uses editXxx state.
          Interview Date field only shows when status is "Interview".
          To add a new field here: copy from #ADD-MODAL and use editXxx state.
      ─────────────────────────────────────────────── */}
      {editJob && (
        <Modal title="✏️ Edit Job" onClose={() => setEditJob(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            <input placeholder="Job Title / Role"
              value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={inputStyle} />

            <input placeholder="Company Name"
              value={editCompany} onChange={(e) => setEditCompany(e.target.value)} style={inputStyle} />

            <input placeholder="📍 Location (e.g. Mumbai, Remote, Hybrid)"
              value={editLocation} onChange={(e) => setEditLocation(e.target.value)} style={inputStyle} />

            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} style={inputStyle}>
              <option>Applied</option>
              <option>Interview</option>
              <option>Offer</option>
              <option>Rejected</option>
            </select>

            <input placeholder="🔗 Job URL"
              value={editSourceUrl} onChange={(e) => setEditSourceUrl(e.target.value)} style={inputStyle} />

            <textarea placeholder="Notes (optional)"
              value={editNotes} onChange={(e) => setEditNotes(e.target.value)}
              rows={3} style={{ ...inputStyle, resize: "vertical" }} />

            <textarea placeholder="📄 Job Description"
              value={editDescription} onChange={(e) => setEditDescription(e.target.value)}
              rows={4} style={{ ...inputStyle, resize: "vertical" }} />

            {/* Interview Date — only visible when status is Interview */}
            {editStatus === "Interview" && (
              <div>
                <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6 }}>
                  Interview Date
                </label>
                <input type="date"
                  value={editInterviewDate?.split("T")[0] || ""}
                  onChange={(e) => setEditInterviewDate(e.target.value)} style={inputStyle} />
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button onClick={handleUpdateJob} style={btnSave}>Update Job</button>
              <button onClick={() => setEditJob(null)} style={btnCancel}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

    </AppLayout>
  );
}

export default Dashboard;