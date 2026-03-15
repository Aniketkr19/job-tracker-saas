// ============================================================
// Settings.jsx
// client/src/pages/Settings.jsx
//
// TABS:
//   1. Preferences  — job roles, locations, salary, job type
//   2. Dashboard    — default filter, visible sections
//   3. Password     — change password via API
//   4. Data         — export CSV, clear rejected jobs
// ============================================================

import { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import API from "../../api/axios";
import {
  User, Lock, Database, LayoutDashboard,
  Plus, X, Check, Download, Trash2, Eye, EyeOff,
} from "lucide-react";

// ── localStorage helpers ──────────────────────────────────────
const SETTINGS_KEY = "jt_settings";

const DEFAULT_SETTINGS = {
  preferredRoles:     [],
  preferredLocations: [],
  salaryMin:          "",
  salaryMax:          "",
  jobType:            "Any",
  defaultFilter:      "All",
  showStatCards:      true,
  showUpcoming:       true,
  showRecentActivity: true,
};

function loadSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") };
  } catch { return DEFAULT_SETTINGS; }
}

// ── Shared styles ─────────────────────────────────────────────
const card = {
  background: "#0d1525",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 14, padding: "22px 24px", marginBottom: 14,
};

const inputStyle = {
  width: "100%", padding: "10px 12px", borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)", background: "#111827",
  color: "white", fontSize: 13, outline: "none", boxSizing: "border-box",
};

const sectionTitle = { fontSize: 14, fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px" };
const sectionDesc  = { fontSize: 12, color: "#475569", margin: "0 0 14px" };
const labelStyle   = {
  fontSize: 11, fontWeight: 700, color: "#64748b",
  textTransform: "uppercase", letterSpacing: "0.07em",
  marginBottom: 6, display: "block",
};

// ── Toggle ────────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{
      width: 42, height: 23, borderRadius: 12, cursor: "pointer", flexShrink: 0,
      background: value ? "#22c55e" : "#1e293b",
      border: `1px solid ${value ? "#16a34a" : "rgba(255,255,255,0.08)"}`,
      position: "relative", transition: "background 0.2s",
    }}>
      <div style={{
        width: 17, height: 17, borderRadius: "50%", background: "white",
        position: "absolute", top: 2, left: value ? 21 : 2, transition: "left 0.2s",
      }} />
    </div>
  );
}

// ── Tag input ─────────────────────────────────────────────────
function TagInput({ tags, onChange, placeholder }) {
  const [val, setVal] = useState("");
  const add = () => {
    const t = val.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setVal("");
  };
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: tags.length ? 10 : 0 }}>
        {tags.map(tag => (
          <span key={tag} style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
            background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8",
          }}>
            {tag}
            <X size={11} style={{ cursor: "pointer" }} onClick={() => onChange(tags.filter(t => t !== tag))} />
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder} style={{ ...inputStyle, flex: 1 }} />
        <button onClick={add} style={{
          padding: "10px 14px", background: "rgba(99,102,241,0.12)",
          border: "1px solid rgba(99,102,241,0.25)", borderRadius: 8,
          color: "#818cf8", cursor: "pointer", display: "flex", alignItems: "center",
        }}>
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}

// ── Password input ────────────────────────────────────────────
function PwInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input type={show ? "text" : "password"} value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...inputStyle, paddingRight: 40 }} />
      <button onClick={() => setShow(s => !s)} style={{
        position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
        background: "none", border: "none", color: "#475569", cursor: "pointer",
        display: "flex", alignItems: "center",
      }}>
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

// ── Row toggle item ───────────────────────────────────────────
function ToggleRow({ label, desc, value, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", margin: 0 }}>{label}</p>
        {desc && <p style={{ fontSize: 11, color: "#475569", margin: "2px 0 0" }}>{desc}</p>}
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
function Settings() {
  const [tab, setTab]           = useState("preferences");
  const [settings, setSettings] = useState(loadSettings);
  const [saved, setSaved]       = useState(false);

  // Password state
  const [curPw, setCurPw]       = useState("");
  const [newPw, setNewPw]       = useState("");
  const [conPw, setConPw]       = useState("");
  const [pwMsg, setPwMsg]       = useState({ text: "", ok: false });
  const [pwLoading, setPwLoading] = useState(false);

  // Data state
  const [dataMsg, setDataMsg]   = useState("");

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 1500);
    return () => clearTimeout(t);
  }, [settings]);

  const set = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

  // Change password
  const handleChangePw = async () => {
    setPwMsg({ text: "", ok: false });
    if (!curPw || !newPw || !conPw) return setPwMsg({ text: "All fields required", ok: false });
    if (newPw !== conPw)            return setPwMsg({ text: "New passwords don't match", ok: false });
    if (newPw.length < 6)           return setPwMsg({ text: "Min 6 characters", ok: false });
    setPwLoading(true);
    try {
      await API.put("/users/change-password", { currentPassword: curPw, newPassword: newPw });
      setPwMsg({ text: "Password changed successfully!", ok: true });
      setCurPw(""); setNewPw(""); setConPw("");
    } catch (err) {
      setPwMsg({ text: err.response?.data?.message || "Failed to change password", ok: false });
    } finally { setPwLoading(false); }
  };

  // Export CSV
  const handleExport = async () => {
    try {
      const res  = await API.get("/jobs");
      const jobs = res.data;
      if (!jobs.length) return setDataMsg("No jobs to export");
      const headers = ["Title","Company","Status","Location","Notes","Interview Date","Created"];
      const rows    = jobs.map(j => [
        j.title, j.company, j.status, j.location || "",
        (j.notes || "").replace(/,/g,";"),
        j.interviewDate ? new Date(j.interviewDate).toLocaleDateString() : "",
        new Date(j.createdAt).toLocaleDateString(),
      ]);
      const csv  = [headers, ...rows].map(r => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `jobs-${Date.now()}.csv`; a.click();
      URL.revokeObjectURL(url);
      setDataMsg("✅ Exported successfully!");
      setTimeout(() => setDataMsg(""), 3000);
    } catch { setDataMsg("Export failed. Is server running?"); }
  };

  // Clear rejected
  const handleClearRejected = async () => {
    if (!window.confirm("Delete all Rejected jobs? Cannot be undone.")) return;
    try {
      const res  = await API.get("/jobs");
      const jobs = res.data.filter(j => j.status === "Rejected");
      if (!jobs.length) return setDataMsg("No rejected jobs found");
      await Promise.all(jobs.map(j => API.delete(`/jobs/${j.id}`)));
      setDataMsg(`✅ Deleted ${jobs.length} rejected job${jobs.length !== 1 ? "s" : ""}`);
      setTimeout(() => setDataMsg(""), 3000);
    } catch { setDataMsg("Failed to delete rejected jobs"); }
  };

  const tabs = [
    { id: "preferences", label: "Preferences", icon: <User size={14} /> },
    { id: "dashboard",   label: "Dashboard",   icon: <LayoutDashboard size={14} /> },
    { id: "password",    label: "Password",    icon: <Lock size={14} /> },
    { id: "data",        label: "Data",        icon: <Database size={14} /> },
  ];

  return (
    <AppLayout>
      <div style={{ padding: "0 24px 40px", maxWidth: 700 }}>

        {/* Header */}
        <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>Settings</h2>
            <p style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>Customize your experience</p>
          </div>
          {saved && (
            <span style={{ fontSize: 12, fontWeight: 600, color: "#4ade80",
              display: "flex", alignItems: "center", gap: 5 }}>
              <Check size={13} /> Saved
            </span>
          )}
        </div>

        {/* Tab bar */}
        <div style={{
          display: "flex", gap: 4, marginBottom: 22,
          background: "#0d1525", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12, padding: 4,
        }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "9px 8px", borderRadius: 9, border: "none",
              cursor: "pointer", fontSize: 12, fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              background: tab === t.id ? "#1e293b" : "transparent",
              color: tab === t.id ? "#f1f5f9" : "#475569",
              transition: "all 0.15s",
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── PREFERENCES ─────────────────────────────────── */}
        {tab === "preferences" && (
          <>
            <div style={card}>
              <p style={sectionTitle}>Preferred Job Roles</p>
              <p style={sectionDesc}>Auto-suggested when tagging documents</p>
              <TagInput tags={settings.preferredRoles}
                onChange={v => set("preferredRoles", v)}
                placeholder='Type role e.g. "SDE-2" and press Enter' />
            </div>

            <div style={card}>
              <p style={sectionTitle}>Preferred Locations</p>
              <p style={sectionDesc}>Cities or work modes you're targeting</p>
              <TagInput tags={settings.preferredLocations}
                onChange={v => set("preferredLocations", v)}
                placeholder='e.g. "Remote" or "Bangalore"' />
            </div>

            <div style={card}>
              <p style={sectionTitle}>Expected Salary Range</p>
              <p style={sectionDesc}>Your target CTC (₹ LPA)</p>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <span style={labelStyle}>Min</span>
                  <input type="number" placeholder="e.g. 6" value={settings.salaryMin}
                    onChange={e => set("salaryMin", e.target.value)} style={inputStyle} />
                </div>
                <span style={{ color: "#334155", marginTop: 18 }}>—</span>
                <div style={{ flex: 1 }}>
                  <span style={labelStyle}>Max</span>
                  <input type="number" placeholder="e.g. 20" value={settings.salaryMax}
                    onChange={e => set("salaryMax", e.target.value)} style={inputStyle} />
                </div>
              </div>
            </div>

            <div style={card}>
              <p style={sectionTitle}>Job Type</p>
              <p style={sectionDesc}>What kind of role are you looking for?</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["Any","Full-time","Part-time","Internship","Contract","Freelance"].map(type => (
                  <button key={type} onClick={() => set("jobType", type)} style={{
                    padding: "7px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    cursor: "pointer", border: "1px solid",
                    background: settings.jobType === type ? "rgba(34,197,94,0.15)" : "transparent",
                    borderColor: settings.jobType === type ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)",
                    color: settings.jobType === type ? "#4ade80" : "#64748b",
                  }}>{type}</button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── DASHBOARD ───────────────────────────────────── */}
        {tab === "dashboard" && (
          <>
            <div style={card}>
              <p style={sectionTitle}>Default Status Filter</p>
              <p style={sectionDesc}>Which tab opens by default on the Dashboard</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["All","Applied","Interview","Offer","Rejected"].map(f => (
                  <button key={f} onClick={() => set("defaultFilter", f)} style={{
                    padding: "7px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    cursor: "pointer", border: "1px solid",
                    background: settings.defaultFilter === f ? "rgba(34,197,94,0.15)" : "transparent",
                    borderColor: settings.defaultFilter === f ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)",
                    color: settings.defaultFilter === f ? "#4ade80" : "#64748b",
                  }}>{f}</button>
                ))}
              </div>
            </div>

            <div style={card}>
              <p style={sectionTitle}>Visible Sections</p>
              <p style={sectionDesc}>Show or hide sections on the Dashboard</p>
              <ToggleRow label="Stat Cards" desc="Applied, Interviews, Offers, Rejected counts"
                value={settings.showStatCards} onChange={v => set("showStatCards", v)} />
              <ToggleRow label="Upcoming Interviews" desc="Next scheduled interviews"
                value={settings.showUpcoming} onChange={v => set("showUpcoming", v)} />
              <ToggleRow label="Recent Activity" desc="Latest job status changes"
                value={settings.showRecentActivity} onChange={v => set("showRecentActivity", v)} />
            </div>
          </>
        )}

        {/* ── PASSWORD ────────────────────────────────────── */}
        {tab === "password" && (
          <div style={card}>
            <p style={sectionTitle}>Change Password</p>
            <p style={sectionDesc}>Update your account password</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <span style={labelStyle}>Current Password</span>
                <PwInput value={curPw} onChange={setCurPw} placeholder="Enter current password" />
              </div>
              <div>
                <span style={labelStyle}>New Password</span>
                <PwInput value={newPw} onChange={setNewPw} placeholder="Enter new password (min 6 chars)" />
              </div>
              <div>
                <span style={labelStyle}>Confirm New Password</span>
                <PwInput value={conPw} onChange={setConPw} placeholder="Repeat new password" />
              </div>

              {pwMsg.text && (
                <div style={{
                  padding: "10px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: pwMsg.ok ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                  border: `1px solid ${pwMsg.ok ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                  color: pwMsg.ok ? "#4ade80" : "#f87171",
                }}>
                  {pwMsg.text}
                </div>
              )}

              <button onClick={handleChangePw} disabled={pwLoading} style={{
                padding: "11px", background: "linear-gradient(135deg,#6366f1,#4f46e5)",
                border: "none", borderRadius: 10, color: "white",
                fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: pwLoading ? 0.6 : 1,
              }}>
                {pwLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        )}

        {/* ── DATA ────────────────────────────────────────── */}
        {tab === "data" && (
          <>
            {dataMsg && (
              <div style={{
                padding: "12px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: dataMsg.startsWith("✅") ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                border: `1px solid ${dataMsg.startsWith("✅") ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                color: dataMsg.startsWith("✅") ? "#4ade80" : "#f87171", marginBottom: 14,
              }}>
                {dataMsg}
              </div>
            )}

            <div style={card}>
              <p style={sectionTitle}>Export Jobs</p>
              <p style={sectionDesc}>Download all your jobs as a CSV file — open in Excel or Google Sheets</p>
              <button onClick={handleExport} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "11px 20px", background: "rgba(56,189,248,0.1)",
                border: "1px solid rgba(56,189,248,0.25)", borderRadius: 10,
                color: "#38bdf8", fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}>
                <Download size={15} /> Export as CSV
              </button>
            </div>

            <div style={card}>
              <p style={sectionTitle}>Clear Rejected Jobs</p>
              <p style={sectionDesc}>Permanently delete all jobs with status "Rejected" to clean up your board</p>
              <button onClick={handleClearRejected} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "11px 20px", background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10,
                color: "#f87171", fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}>
                <Trash2 size={15} /> Clear Rejected Jobs
              </button>
            </div>

            <div style={card}>
              <p style={sectionTitle}>Reset Preferences</p>
              <p style={sectionDesc}>Clear all your saved settings and reset to defaults</p>
              <button onClick={() => {
                if (window.confirm("Reset all settings to default?")) {
                  setSettings(DEFAULT_SETTINGS);
                }
              }} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "11px 20px", background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
                color: "#64748b", fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}>
                <X size={15} /> Reset to Defaults
              </button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}

export default Settings;