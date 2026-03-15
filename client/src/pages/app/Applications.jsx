// ============================================================
// Applications.jsx
// client/src/pages/applications/Applications.jsx
// Kanban board with drag-and-drop, stats, search, job details
// ============================================================

import { useEffect, useState, useCallback } from "react";
import API from "../../api/axios";
import AppLayout from "../../components/layout/AppLayout";
import {
  DndContext, pointerWithin, DragOverlay, useDroppable
} from "@dnd-kit/core";
import {
  SortableContext, useSortable, verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Search, Briefcase, MapPin, ExternalLink,
  Calendar, ChevronRight, X, Building2
} from "lucide-react";

// ── Status config ─────────────────────────────────────────────
const STATUS_CONFIG = {
  Applied:   { color: "#60a5fa", bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.25)",  dot: "#3b82f6" },
  Interview: { color: "#a78bfa", bg: "rgba(139,92,246,0.12)",  border: "rgba(139,92,246,0.25)",  dot: "#8b5cf6" },
  Offer:     { color: "#4ade80", bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.25)",   dot: "#22c55e" },
  Rejected:  { color: "#f87171", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.25)",   dot: "#ef4444" },
};

const STATUSES = ["Applied", "Interview", "Offer", "Rejected"];

// Company initial color palette
const COMPANY_COLORS = [
  "#6366f1","#8b5cf6","#ec4899","#f59e0b",
  "#10b981","#3b82f6","#ef4444","#14b8a6",
];

function getCompanyColor(name = "") {
  const idx = name.charCodeAt(0) % COMPANY_COLORS.length;
  return COMPANY_COLORS[idx];
}

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

function cleanNotes(notes = "") {
  return notes.replace(/Saved from [\w.]+ — https?:\/\/\S+/gi, "").trim();
}

// ── Job Card (draggable) ──────────────────────────────────────
function JobCard({ job, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: job.id });

  const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.Applied;
  const color = getCompanyColor(job.company);
  const notes = cleanNotes(job.notes || "");

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        background: "#0d1525",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12,
        padding: "14px 15px",
        marginBottom: 10,
        cursor: "grab",
        userSelect: "none",
      }}
      {...attributes}
      {...listeners}
      onClick={() => onClick(job)}
    >
      {/* Top row: company logo + title */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8, flexShrink: 0,
          background: `${color}22`, border: `1px solid ${color}44`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 800, color,
        }}>
          {job.company?.charAt(0).toUpperCase() || "?"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 13, fontWeight: 700, color: "#f1f5f9", margin: 0,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {job.title}
          </p>
          <p style={{
            fontSize: 11, color: "#475569", margin: "2px 0 0",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {job.company}
          </p>
        </div>
      </div>

      {/* Location + date row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        {job.location && (
          <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: "#475569" }}>
            <MapPin size={9} /> {job.location}
          </span>
        )}
        {job.interviewDate && (
          <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: "#a78bfa" }}>
            <Calendar size={9} /> {formatDate(job.interviewDate)}
          </span>
        )}
        {notes && (
          <span style={{ fontSize: 10, color: "#334155", flex: 1, minWidth: 0,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {notes.slice(0, 35)}…
          </span>
        )}
      </div>
    </div>
  );
}

// ── Column (droppable) ────────────────────────────────────────
function Column({ status, jobs, onJobClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const cfg = STATUS_CONFIG[status];

  return (
    <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
      {/* Column header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 12, padding: "0 2px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: cfg.dot, boxShadow: `0 0 6px ${cfg.dot}`,
          }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8",
            textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {status}
          </span>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
          background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
        }}>
          {jobs.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        style={{
          flex: 1,
          background: isOver ? cfg.bg : "rgba(255,255,255,0.02)",
          border: `1px solid ${isOver ? cfg.border : "rgba(255,255,255,0.05)"}`,
          borderRadius: 14,
          padding: 12,
          minHeight: 200,
          transition: "all 0.15s",
        }}
      >
        <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
          {jobs.map(job => (
            <JobCard key={job.id} job={job} onClick={onJobClick} />
          ))}
        </SortableContext>

        {jobs.length === 0 && (
          <div style={{ textAlign: "center", padding: "30px 0", color: "#1e293b" }}>
            <Briefcase size={22} style={{ marginBottom: 6, opacity: 0.4 }} />
            <p style={{ fontSize: 11, color: "#1e293b" }}>Drop here</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Job Detail Drawer ─────────────────────────────────────────
function JobDrawer({ job, onClose, onStatusChange }) {
  if (!job) return null;
  const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.Applied;
  const color = getCompanyColor(job.company);
  const notes = cleanNotes(job.notes || "");

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.5)", zIndex: 200, backdropFilter: "blur(3px)",
        }}
      />
      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, width: 400, height: "100%",
        background: "#0a0f1a", borderLeft: "1px solid rgba(255,255,255,0.08)",
        zIndex: 201, overflowY: "auto", padding: 28,
        boxShadow: "-20px 0 60px rgba(0,0,0,0.6)",
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position: "absolute", top: 20, right: 20,
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8, padding: 6, cursor: "pointer", color: "#64748b",
          display: "flex", alignItems: "center",
        }}>
          <X size={15} />
        </button>

        {/* Company header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: `${color}22`, border: `1px solid ${color}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 900, color, flexShrink: 0,
          }}>
            {job.company?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>
              {job.title}
            </h3>
            <p style={{ fontSize: 13, color: "#475569", margin: "3px 0 0" }}>{job.company}</p>
          </div>
        </div>

        {/* Status badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 14px", borderRadius: 20, marginBottom: 20,
          background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
          fontSize: 12, fontWeight: 700,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />
          {job.status}
        </div>

        {/* Change status */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#334155",
            textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            Move to
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {STATUSES.filter(s => s !== job.status).map(s => {
              const c = STATUS_CONFIG[s];
              return (
                <button key={s} onClick={() => onStatusChange(job.id, s)}
                  style={{
                    padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                    cursor: "pointer", border: `1px solid ${c.border}`,
                    background: c.bg, color: c.color,
                  }}>
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {job.location && (
            <div style={{ display: "flex", alignItems: "center", gap: 10,
              padding: "12px 14px", background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10 }}>
              <MapPin size={14} style={{ color: "#4ade80", flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "#94a3b8" }}>{job.location}</span>
            </div>
          )}

          {job.interviewDate && (
            <div style={{ display: "flex", alignItems: "center", gap: 10,
              padding: "12px 14px", background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10 }}>
              <Calendar size={14} style={{ color: "#a78bfa", flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "#94a3b8" }}>
                Interview: {new Date(job.interviewDate).toLocaleDateString("en-US",
                  { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
          )}

          {job.sourceUrl && (
            <a href={job.sourceUrl} target="_blank" rel="noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 10,
                padding: "12px 14px", background: "rgba(56,189,248,0.06)",
                border: "1px solid rgba(56,189,248,0.2)", borderRadius: 10,
                color: "#38bdf8", fontSize: 13, textDecoration: "none" }}>
              <ExternalLink size={14} style={{ flexShrink: 0 }} />
              View Job Posting
            </a>
          )}

          {notes && (
            <div style={{ padding: "14px", background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#334155",
                textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Notes
              </p>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, margin: 0 }}>{notes}</p>
            </div>
          )}

          {job.description && (
            <div style={{ padding: "14px", background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#334155",
                textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Job Description
              </p>
              <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.7, margin: 0,
                maxHeight: 200, overflowY: "auto" }}>
                {job.description}
              </p>
            </div>
          )}

          <p style={{ fontSize: 10, color: "#1e293b", textAlign: "right" }}>
            Added {formatDate(job.createdAt)}
          </p>
        </div>
      </div>
    </>
  );
}

// ── Main Component ────────────────────────────────────────────
function Applications() {
  const [jobs, setJobs]           = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await API.get("/jobs");
      setJobs(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleDragStart = (event) => {
    setSelectedJob(null);
    setActiveJob(jobs.find(j => j.id === event.active.id) || null);
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveJob(null);
    if (!over || !STATUSES.includes(over.id)) return;
    const jobId    = active.id;
    const newStatus = over.id;
    if (jobs.find(j => j.id === jobId)?.status === newStatus) return;

    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
    try {
      await API.put(`/jobs/${jobId}`, { status: newStatus });
    } catch {
      fetchJobs(); // revert on error
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
    setSelectedJob(prev => prev ? { ...prev, status: newStatus } : null);
    try {
      await API.put(`/jobs/${jobId}`, { status: newStatus });
    } catch {
      fetchJobs();
    }
  };

  const filtered = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.company.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const stats = STATUSES.map(s => ({
    label: s, count: jobs.filter(j => j.status === s).length,
    ...STATUS_CONFIG[s],
  }));

  return (
    <AppLayout>
      <div style={{ padding: "0 24px 40px" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>
            Applications Pipeline
          </h2>
          <p style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>
            Drag cards between columns to update status
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          {stats.map(({ label, count, color, bg, border }) => (
            <div key={label} style={{
              flex: 1, minWidth: 100, padding: "14px 16px",
              background: "#0d1525", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
            }}>
              <div style={{ fontSize: 24, fontWeight: 800, color }}>{count}</div>
              <div style={{ fontSize: 10, color: "#475569", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>
                {label}
              </div>
            </div>
          ))}
          <div style={{
            flex: 1, minWidth: 100, padding: "14px 16px",
            background: "#0d1525", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12,
          }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#f1f5f9" }}>{jobs.length}</div>
            <div style={{ fontSize: 10, color: "#475569", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>
              Total
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: 20,
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10, padding: "9px 14px", maxWidth: 340,
        }}>
          <Search size={14} style={{ color: "#475569", flexShrink: 0 }} />
          <input
            placeholder="Search by title or company..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ background: "none", border: "none", outline: "none",
              color: "#e2e8f0", fontSize: 13, width: "100%" }}
          />
          {search && (
            <X size={13} style={{ color: "#475569", cursor: "pointer" }}
              onClick={() => setSearch("")} />
          )}
        </div>

        {/* Kanban board */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#334155" }}>
            Loading jobs...
          </div>
        ) : (
          <DndContext
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 16,
              alignItems: "start",
            }}>
              {STATUSES.map(status => (
                <Column
                  key={status}
                  status={status}
                  jobs={filtered.filter(j => j.status === status)}
                  onJobClick={setSelectedJob}
                />
              ))}
            </div>

            <DragOverlay>
              {activeJob && (
                <div style={{
                  padding: "14px 15px", background: "#0d1525",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 12, color: "white",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
                  opacity: 0.95,
                }}>
                  <b style={{ fontSize: 13 }}>{activeJob.title}</b>
                  <p style={{ fontSize: 11, color: "#475569", margin: "4px 0 0" }}>
                    {activeJob.company}
                  </p>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Job detail drawer */}
      <JobDrawer
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onStatusChange={handleStatusChange}
      />
    </AppLayout>
  );
}

export default Applications;