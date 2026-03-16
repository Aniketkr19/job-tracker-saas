// ============================================================
// Dashboard.jsx — mobile responsive fixes applied
// ============================================================

import { useEffect, useState, useCallback } from "react";
import API from "../../api/axios";
import AppLayout from "../../components/layout/AppLayout";


// ─────────────────────────────────────────
// #STATUS-BADGE
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
// ─────────────────────────────────────────
function JobCard({ job, onEdit, onDelete }) {
  const [hovered, setHovered]   = useState(false);
  const [expanded, setExpanded] = useState(false);

  const cleanNotes = (job.notes || "")
    .replace(/Saved from [\w.]+ — https?:\/\/\S+/gi, "")
    .trim();

  const hasMoreInfo = !!(job.location || job.description || job.sourceUrl || cleanNotes);

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
        overflow: "hidden",
      }}
    >
      {/* Main row */}
      <div style={{ padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>

        {/* LEFT: logo + title + company */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
          <CompanyLogo name={job.company} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", margin: 0,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {job.title}
            </p>
            <p style={{ fontSize: 12, color: "#38bdf8", fontWeight: 600, margin: "3px 0 0" }}>
              {job.company}
            </p>
            {job.location && (
              <p style={{ fontSize: 11, color: "#475569", margin: "3px 0 0" }}>
                📍 {job.location}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT: badge + buttons — wraps to next line on very small screens */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {job.interviewDate && (
            <span style={{ fontSize: 11, color: "#334155", marginRight: 2 }}>
              📅 {job.interviewDate.split("T")[0]}
            </span>
          )}
          <StatusBadge status={job.status} />

          {hasMoreInfo && (
            <button
              onClick={() => setExpanded(v => !v)}
              style={{
                padding: "5px 10px",
                background: expanded ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${expanded ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 7, color: expanded ? "#818cf8" : "#64748b",
                fontSize: 11, fontWeight: 700, cursor: "pointer",
              }}
            >
              {expanded ? "▲" : "▼ Info"}
            </button>
          )}

          <button onClick={() => onEdit(job)} style={{
            padding: "5px 10px", background: "rgba(56,189,248,0.08)",
            border: "1px solid rgba(56,189,248,0.2)", borderRadius: 7,
            color: "#38bdf8", fontSize: 11, fontWeight: 700, cursor: "pointer",
          }}>Edit</button>

          <button onClick={() => onDelete(job.id)} style={{
            padding: "5px 10px", background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)", borderRadius: 7,
            color: "#f87171", fontSize: 11, fontWeight: 700, cursor: "pointer",
          }}>Del</button>
        </div>
      </div>

      {/* Expandable panel */}
      {expanded && hasMoreInfo && (
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "14px 16px",
          background: "rgba(0,0,0,0.2)",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
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
                🔗 {shortenUrl(job.sourceUrl)} ↗
              </a>
            )}
          </div>
          {cleanNotes && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#334155",
                textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>Notes</p>
              <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.6 }}>{cleanNotes}</p>
            </div>
          )}
          {job.description && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#334155",
                textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>Description</p>
              <p style={{
                fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.7,
                maxHeight: 180, overflowY: "auto",
                padding: "10px 14px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 8, whiteSpace: "pre-wrap",
              }}>{job.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ─────────────────────────────────────────
// #STAT-CARD
// ─────────────────────────────────────────
function DashStatCard({ label, value, icon, bg, border, valueColor, trend }) {
  return (
    <div style={{
      borderRadius: 16, padding: "18px 16px", background: bg,
      border: `1px solid ${border}`, position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80,
        borderRadius: "50%", background: valueColor, opacity: 0.1 }} />
      <span style={{ fontSize: 20, display: "block", marginBottom: 8 }}>{icon}</span>
      <div style={{ fontSize: 28, fontWeight: 800, color: valueColor, lineHeight: 1, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.08em", opacity: 0.5, color: "#e2e8f0" }}>
        {label}
      </div>
      {trend && (
        <span style={{ position: "absolute", bottom: 10, right: 12, fontSize: 9, fontWeight: 700,
          padding: "2px 6px", borderRadius: 6, background: `${valueColor}20`, color: valueColor }}>
          {trend}
        </span>
      )}
    </div>
  );
}


// ─────────────────────────────────────────
// #INPUT-STYLE
// ─────────────────────────────────────────
const inputStyle = {
  width: "100%", padding: "10px 12px", borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)", background: "#111827",
  color: "white", fontSize: 14, outline: "none", boxSizing: "border-box",
};


// ─────────────────────────────────────────
// #MODAL
// ─────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center",
      alignItems: "center", zIndex: 300, backdropFilter: "blur(4px)",
      padding: "16px", boxSizing: "border-box",
    }}>
      <div style={{
        background: "#0d1525", padding: "24px 20px", borderRadius: 18,
        width: "100%", maxWidth: 440,
        border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}


// ─────────────────────────────────────────
// #DASHBOARD
// ─────────────────────────────────────────
function Dashboard() {

  const [jobs, setJobs]         = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter]     = useState(
    JSON.parse(localStorage.getItem("jt_settings") || "{}").defaultFilter || "All"
  );
  const [search, setSearch]   = useState("");
  const [editJob, setEditJob] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [title, setTitle]               = useState("");
  const [company, setCompany]           = useState("");
  const [status, setStatus]             = useState("");
  const [notes, setNotes]               = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [location, setLocation]         = useState("");
  const [description, setDescription]   = useState("");
  const [sourceUrl, setSourceUrl]       = useState("");

  const [editTitle, setEditTitle]               = useState("");
  const [editCompany, setEditCompany]           = useState("");
  const [editStatus, setEditStatus]             = useState("");
  const [editNotes, setEditNotes]               = useState("");
  const [editInterviewDate, setEditInterviewDate] = useState("");
  const [editLocation, setEditLocation]         = useState("");
  const [editDescription, setEditDescription]   = useState("");
  const [editSourceUrl, setEditSourceUrl]       = useState("");

  const settings = JSON.parse(localStorage.getItem("jt_settings") || "{}");

  // Track mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchJobs = useCallback(async () => {
    const token = localStorage.getItem("token");
    const res = await API.get("/jobs", { headers: { Authorization: `Bearer ${token}` } });
    setJobs(res.data);
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);
  useEffect(() => {
    const id = setInterval(fetchJobs, 10000);
    return () => clearInterval(id);
  }, [fetchJobs]);
  useEffect(() => {
    window.addEventListener("focus", fetchJobs);
    return () => window.removeEventListener("focus", fetchJobs);
  }, [fetchJobs]);
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") { setShowForm(false); setEditJob(null); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    await API.delete(`/jobs/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    setJobs(jobs.filter((j) => j.id !== id));
  };

  const handleAddJob = async () => {
    const token = localStorage.getItem("token");
    await API.post("/jobs",
      { title, company, status, notes, interviewDate, location, description, sourceUrl },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const res = await API.get("/jobs", { headers: { Authorization: `Bearer ${token}` } });
    setJobs(res.data);
    setShowForm(false);
    setTitle(""); setCompany(""); setStatus(""); setNotes(""); setInterviewDate("");
    setLocation(""); setDescription(""); setSourceUrl("");
  };

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

  const applied      = jobs.filter((j) => j.status === "Applied").length;
  const interview    = jobs.filter((j) => j.status === "Interview").length;
  const offer        = jobs.filter((j) => j.status === "Offer").length;
  const rejected     = jobs.filter((j) => j.status === "Rejected").length;
  const responseRate = applied === 0 ? 0 : Math.round((interview / applied) * 100);

  const filteredJobs = jobs
    .filter((j) => filter === "All" || j.status === filter)
    .filter((j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase())
    );

  const upcomingInterviews = jobs
    .filter((j) => j.status === "Interview" && j.interviewDate)
    .sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate))
    .slice(0, 3);

  const daysUntil = (dateStr) => {
    const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "Past";
    if (diff === 0) return "Today!";
    return `${diff}d left`;
  };

  const recentActivity = [...jobs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map((j) => ({
      id: j.id,
      text: j.status === "Offer"     ? `Offer from ${j.company}`
          : j.status === "Interview" ? `Interview at ${j.company}`
          : j.status === "Rejected"  ? `Rejected by ${j.company}`
          :                            `Applied to ${j.company}`,
      company: j.company,
      status: j.status,
      time: new Date(j.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }));

  const activityDotColor = {
    Offer: "#4ade80", Interview: "#fbbf24", Rejected: "#f87171", Applied: "#60a5fa",
  };

  const panelStyle = {
    background: "#0d1525",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 18, padding: isMobile ? 16 : 20,
  };

  const btnSave = {
    flex: 1, padding: 11, background: "#22c55e", border: "none",
    borderRadius: 8, color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer",
  };

  const btnCancel = {
    flex: 1, padding: 11, background: "#1e293b", border: "none",
    borderRadius: 8, color: "#94a3b8", fontWeight: 600, fontSize: 14, cursor: "pointer",
  };

  return (
    <AppLayout search={search} setSearch={setSearch} onAddClick={() => setShowForm(true)}>
      <div style={{ paddingBottom: 40 }}>

        {/* ── STAT CARDS ── */}
        {settings.showStatCards !== false && (
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "repeat(2, 1fr)"          // 2 columns on mobile
              : "repeat(auto-fit, minmax(160px, 1fr))",
            gap: isMobile ? 10 : 14,
            marginBottom: 20,
          }}>
            <DashStatCard label="Applied"       value={applied}            icon="📨" bg="linear-gradient(135deg,#0c1a3a,#0f2050)" border="rgba(59,130,246,0.25)"  valueColor="#60a5fa" />
            <DashStatCard label="Interviews"    value={interview}          icon="🎯" bg="linear-gradient(135deg,#1a0c3a,#2d1a60)" border="rgba(139,92,246,0.25)"  valueColor="#a78bfa" trend={interview > 0 ? "▲ Active" : undefined} />
            <DashStatCard label="Offers"        value={offer}              icon="🏆" bg="linear-gradient(135deg,#0a1f14,#0f3020)" border="rgba(34,197,94,0.25)"   valueColor="#4ade80" trend={offer > 0 ? "🔥 Hot" : undefined} />
            <DashStatCard label="Rejected"      value={rejected}           icon="❌" bg="linear-gradient(135deg,#1f0a0a,#3a1010)" border="rgba(239,68,68,0.25)"   valueColor="#f87171" />
            {/* Response rate spans full width on mobile */}
            <div style={{ gridColumn: isMobile ? "1 / -1" : "auto" }}>
              <DashStatCard label="Response Rate" value={`${responseRate}%`} icon="📊" bg="linear-gradient(135deg,#0f1520,#1a2035)" border="rgba(148,163,184,0.15)" valueColor="#e2e8f0" />
            </div>
          </div>
        )}

        {/* ── UPCOMING + RECENT ACTIVITY ── */}
        {(settings.showUpcoming !== false || settings.showRecentActivity !== false) && (
          <div style={{
            display: "grid",
            // KEY FIX: single column on mobile, two columns on desktop
            gridTemplateColumns: isMobile ? "1fr" : "1fr 300px",
            gap: 16,
            marginBottom: 24,
          }}>

            {settings.showUpcoming !== false && (
              <div style={panelStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>🗓 Upcoming Interviews</span>
                  <span style={{ fontSize: 12, color: "#38bdf8", fontWeight: 600 }}>
                    {upcomingInterviews.length} scheduled
                  </span>
                </div>
                {upcomingInterviews.length === 0 ? (
                  <p style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: "16px 0" }}>
                    No upcoming interviews
                  </p>
                ) : (
                  upcomingInterviews.map((job) => (
                    <div key={job.id} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                      borderRadius: 12, background: "rgba(16,185,129,0.05)",
                      border: "1px solid rgba(16,185,129,0.15)", marginBottom: 10,
                    }}>
                      <div style={{ width: 10, height: 10, background: "#10b981", borderRadius: "50%",
                        flexShrink: 0, boxShadow: "0 0 8px #10b981" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#ecfdf5", margin: 0,
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{job.company}</p>
                        <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{job.title}</p>
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
                <p style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 14, marginTop: 0 }}>
                  ⚡ Recent Activity
                </p>
                {recentActivity.length === 0 ? (
                  <p style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: "16px 0" }}>
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
                      <p style={{ fontSize: 12, color: "#94a3b8", flex: 1, margin: 0, lineHeight: 1.4,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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

        {/* ── JOBS LIST ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>My Applications</h3>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20,
            background: "rgba(255,255,255,0.06)", color: "#94a3b8", fontWeight: 600 }}>
            {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"}
          </span>
        </div>

        {/* Filter tabs — scrollable on mobile */}
        <div style={{
          display: "flex", gap: 8, marginBottom: 18,
          overflowX: "auto", paddingBottom: 4,
          // Hide scrollbar visually
          msOverflowStyle: "none", scrollbarWidth: "none",
        }}>
          {["All", "Applied", "Interview", "Offer", "Rejected"].map((tab) => (
            <button key={tab} onClick={() => setFilter(tab)} style={{
              padding: "7px 16px", borderRadius: 20, cursor: "pointer",
              border: filter === tab ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(255,255,255,0.08)",
              background: filter === tab ? "rgba(34,197,94,0.15)" : "transparent",
              color: filter === tab ? "#4ade80" : "#64748b",
              fontSize: 12, fontWeight: 600, flexShrink: 0,
            }}>{tab}</button>
          ))}
        </div>

        {/* Job cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filteredJobs.length === 0 ? (
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

      </div>

      {/* ── ADD MODAL ── */}
      {showForm && (
        <Modal title="＋ Add New Job" onClose={() => setShowForm(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input placeholder="Job Title / Role"
              value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
            <input placeholder="Company Name"
              value={company} onChange={(e) => setCompany(e.target.value)} style={inputStyle} />
            <input placeholder="📍 Location (e.g. Mumbai, Remote)"
              value={location} onChange={(e) => setLocation(e.target.value)} style={inputStyle} />
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
              <option value="">Select Status</option>
              <option>Applied</option>
              <option>Interview</option>
              <option>Offer</option>
              <option>Rejected</option>
            </select>
            <input placeholder="🔗 Job URL"
              value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} style={inputStyle} />
            <textarea placeholder="Notes (optional)"
              value={notes} onChange={(e) => setNotes(e.target.value)}
              rows={3} style={{ ...inputStyle, resize: "vertical" }} />
            <textarea placeholder="📄 Job Description"
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

      {/* ── EDIT MODAL ── */}
      {editJob && (
        <Modal title="✏️ Edit Job" onClose={() => setEditJob(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input placeholder="Job Title / Role"
              value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={inputStyle} />
            <input placeholder="Company Name"
              value={editCompany} onChange={(e) => setEditCompany(e.target.value)} style={inputStyle} />
            <input placeholder="📍 Location"
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