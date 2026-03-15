// ============================================================
// Documents.jsx
// client/src/pages/documents/Documents.jsx
//
// QUICK NAVIGATION:
//   #IMPORTS        — imports + axios instance
//   #HELPERS        — file type styles, size/date formatters
//   #STATE          — all useState variables
//   #FETCH          — load documents from API on mount
//   #HANDLERS       — upload, delete, rename, role change
//   #FILTER         — search + role filter logic
//   #RENDER         — JSX starts here
//   #UPLOAD-AREA    — drag & drop + file picker
//   #STATS          — stat cards row
//   #ROLE-FILTER    — filter tabs by role
//   #DOC-GRID       — document cards grid
//   #RENAME-MODAL   — rename modal
// ============================================================

// #IMPORTS ────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from "react";
import AppLayout from "../../components/layout/AppLayout";
import api from "../../api/axios"; // your existing axios instance with auth header
import {
  FileText, Upload, Trash2, Download, Edit3,
  Search, FolderOpen, X, Check,
} from "lucide-react";

// #HELPERS ────────────────────────────────────────────────────

function getFileStyle(type = "") {
  if (type.includes("pdf"))   return { color: "#f87171", label: "PDF",  bg: "rgba(239,68,68,0.1)"   };
  if (type.includes("word") || type.includes("docx") || type.includes("doc"))
                               return { color: "#60a5fa", label: "DOC",  bg: "rgba(59,130,246,0.1)"  };
  if (type.includes("text"))  return { color: "#94a3b8", label: "TXT",  bg: "rgba(148,163,184,0.1)" };
  if (type.includes("image")) return { color: "#a78bfa", label: "IMG",  bg: "rgba(168,85,247,0.1)"  };
  return                              { color: "#fbbf24", label: "FILE", bg: "rgba(245,158,11,0.1)"  };
}

function formatSize(bytes) {
  if (bytes < 1024)         return `${bytes} B`;
  if (bytes < 1024 * 1024)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// Shared input style
const inputStyle = {
  width: "100%", padding: "10px 12px", borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)", background: "#111827",
  color: "white", fontSize: 13, outline: "none", boxSizing: "border-box",
};

// #MAIN COMPONENT ─────────────────────────────────────────────
function Documents() {

  // #STATE ────────────────────────────────────────────────────
  const [docs, setDocs]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [uploading, setUploading]     = useState(false);
  const [error, setError]             = useState("");
  const [search, setSearch]           = useState("");
  const [activeRole, setActiveRole]   = useState("All");
  const [dragOver, setDragOver]       = useState(false);
  const [renameDoc, setRenameDoc]     = useState(null);
  const [renameVal, setRenameVal]     = useState("");
  const [newRole, setNewRole]         = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const fileInputRef = useRef(null);

  // #FETCH ────────────────────────────────────────────────────
  // Load all documents for this user from the server
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/documents");
      setDocs(res.data);
    } catch (err) {
      setError("Failed to load documents. Is your server running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // #HANDLERS ─────────────────────────────────────────────────

  // Upload files to the server
  const handleFiles = useCallback(async (files) => {
    if (!files || files.length === 0) return;

    const role = selectedRole || newRole || "General";

    // Build a FormData object — this is how you send files + text together
    // The backend's multer reads "files" (the field name) for the actual files
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);      // "files" must match upload.array("files") in controller
    });
    formData.append("role", role);          // send the role tag alongside the files

    setUploading(true);
    setError("");
    try {
      await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchDocuments(); // refresh the list
      setNewRole("");
      setSelectedRole("");
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [selectedRole, newRole, fetchDocuments]);

  // Drag & drop handlers
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  // Delete document — removes file from server disk + DB record
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document? This cannot be undone.")) return;
    try {
      await api.delete(`/documents/${id}`);
      setDocs(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      setError("Failed to delete document");
    }
  };

  // Download document — triggers file download via the /download route
  const handleDownload = (doc) => {
    const token = localStorage.getItem("token");
    // Open the download URL directly in a new tab — the server streams the file
    window.open(
      `http://localhost:5000/api/documents/${doc.id}/download?token=${token}`,
      "_blank"
    );
  };

  // Open rename modal
  const startRename = (doc) => {
    setRenameDoc(doc);
    setRenameVal(doc.name);
  };

  // Save renamed document
  const saveRename = async () => {
    if (!renameVal.trim()) return;
    try {
      const res = await api.put(`/documents/${renameDoc.id}`, { name: renameVal.trim() });
      setDocs(prev => prev.map(d => d.id === renameDoc.id ? res.data : d));
      setRenameDoc(null);
    } catch (err) {
      setError("Failed to rename document");
    }
  };

  // Change role tag on a document
  const handleChangeRole = async (id, role) => {
    try {
      const res = await api.put(`/documents/${id}`, { role });
      setDocs(prev => prev.map(d => d.id === id ? res.data : d));
    } catch (err) {
      setError("Failed to update role");
    }
  };

  // #FILTER ───────────────────────────────────────────────────
  const allRoles = ["All", ...Array.from(new Set(docs.map(d => d.role))).sort()];

  const filteredDocs = docs
    .filter(d => activeRole === "All" || d.role === activeRole)
    .filter(d =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.fileName.toLowerCase().includes(search.toLowerCase()) ||
      d.role.toLowerCase().includes(search.toLowerCase())
    );

  // #RENDER ───────────────────────────────────────────────────
  return (
    <AppLayout>
      <div style={{ padding: "0 24px 40px" }}>

        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>
            Documents
          </h2>
          <p style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>
            Upload and organize your resumes and documents by role — stored securely on the server
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            padding: "12px 16px", background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10,
            color: "#f87171", fontSize: 13, marginBottom: 16,
            display: "flex", justifyContent: "space-between",
          }}>
            {error}
            <button onClick={() => setError("")} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer" }}>✕</button>
          </div>
        )}

        {/* #UPLOAD-AREA ──────────────────────────────────────
            Drag & drop zone. Files are sent to POST /api/documents/upload
            as multipart/form-data with field name "files" and optional "role".
        ─────────────────────────────────────────────────── */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragOver ? "#22c55e" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 16, padding: "32px 24px",
            background: dragOver ? "rgba(34,197,94,0.05)" : "rgba(255,255,255,0.02)",
            transition: "all 0.2s", marginBottom: 24, textAlign: "center",
          }}
        >
          <Upload size={32} style={{ color: dragOver ? "#22c55e" : "#334155", marginBottom: 12 }} />
          <p style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>
            Drag & drop files here
          </p>
          <p style={{ fontSize: 12, color: "#475569", marginBottom: 20 }}>
            PDF, DOC, DOCX, TXT, images — max 5MB each, up to 10 files at once
          </p>

          {/* Role tag selector row */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Role:</span>

              {/* Quick-pick existing roles */}
              {Array.from(new Set(docs.map(d => d.role))).slice(0, 5).map(role => (
                <button key={role} onClick={() => setSelectedRole(selectedRole === role ? "" : role)}
                  style={{
                    padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                    cursor: "pointer", border: "1px solid",
                    background: selectedRole === role ? "rgba(34,197,94,0.15)" : "transparent",
                    borderColor: selectedRole === role ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)",
                    color: selectedRole === role ? "#4ade80" : "#64748b",
                  }}
                >
                  {role}
                </button>
              ))}

              {/* Or type a new role */}
              <input
                placeholder="Or type new role..."
                value={newRole}
                onChange={(e) => { setNewRole(e.target.value); setSelectedRole(""); }}
                style={{ ...inputStyle, width: 160, padding: "5px 10px", fontSize: 12, borderRadius: 20 }}
              />
            </div>
          </div>

          {/* File picker button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              padding: "10px 24px", background: "linear-gradient(135deg,#22c55e,#16a34a)",
              border: "none", borderRadius: 10, color: "white",
              fontWeight: 700, fontSize: 13, cursor: "pointer",
              opacity: uploading ? 0.6 : 1,
            }}
          >
            {uploading ? "Uploading..." : "Choose Files"}
          </button>

          {/* Hidden file input — accepts same types as the server fileFilter */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
            style={{ display: "none" }}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {/* #STATS ────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
          {[
            { label: "Total Files",  value: docs.length,
              color: "#60a5fa" },
            { label: "Roles Tagged", value: new Set(docs.map(d => d.role)).size,
              color: "#a78bfa" },
            { label: "PDFs",         value: docs.filter(d => d.fileType?.includes("pdf")).length,
              color: "#f87171" },
            { label: "This Week",    value: docs.filter(d => {
                const diff = (Date.now() - new Date(d.createdAt)) / (1000*60*60*24);
                return diff <= 7;
              }).length,
              color: "#4ade80" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              flex: 1, minWidth: 120, padding: "16px 18px",
              background: "#0d1525", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14,
            }}>
              <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: 11, color: "#475569", fontWeight: 600, marginTop: 2,
                textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Search + count */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 200,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10, padding: "8px 14px",
          }}>
            <Search size={14} style={{ color: "#475569", flexShrink: 0 }} />
            <input
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: "none", border: "none", outline: "none", color: "#e2e8f0", fontSize: 13, width: "100%" }}
            />
          </div>
          <span style={{ fontSize: 12, color: "#475569", fontWeight: 600, flexShrink: 0 }}>
            {filteredDocs.length} {filteredDocs.length === 1 ? "file" : "files"}
          </span>
        </div>

        {/* #ROLE-FILTER ──────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {allRoles.map(role => (
            <button key={role} onClick={() => setActiveRole(role)}
              style={{
                padding: "6px 16px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 600,
                border: activeRole === role ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(255,255,255,0.08)",
                background: activeRole === role ? "rgba(34,197,94,0.15)" : "transparent",
                color: activeRole === role ? "#4ade80" : "#64748b",
              }}
            >
              {role}
            </button>
          ))}
        </div>

        {/* #DOC-GRID ─────────────────────────────────────────── */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#334155" }}>
            <p style={{ fontSize: 14, color: "#475569" }}>Loading documents...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#334155" }}>
            <FolderOpen size={48} style={{ marginBottom: 16, opacity: 0.4 }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: "#475569" }}>
              {docs.length === 0 ? "No documents yet" : "No documents match your filter"}
            </p>
            <p style={{ fontSize: 13, color: "#334155", marginTop: 6 }}>
              {docs.length === 0 ? "Upload your first resume above" : "Try a different role or search term"}
            </p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 14,
          }}>
            {filteredDocs.map((doc) => {
              const fs_ = getFileStyle(doc.fileType);
              return (
                <div
                  key={doc.id}
                  style={{
                    background: "#0d1525",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 14, padding: "18px 18px 14px",
                    display: "flex", flexDirection: "column", gap: 12,
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}
                >
                  {/* File type badge + name */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                      background: fs_.bg, display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: 1,
                    }}>
                      <FileText size={18} style={{ color: fs_.color }} />
                      <span style={{ fontSize: 8, fontWeight: 800, color: fs_.color, letterSpacing: "0.05em" }}>
                        {fs_.label}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 14, fontWeight: 700, color: "#f1f5f9", margin: 0,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {doc.name}
                      </p>
                      <p style={{
                        fontSize: 11, color: "#475569", margin: "3px 0 0",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {doc.fileName}
                      </p>
                    </div>
                  </div>

                  {/* Role tag — click to edit */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, color: "#334155", fontWeight: 600,
                      textTransform: "uppercase", letterSpacing: "0.06em" }}>Role:</span>
                    <RoleEditor
                      value={doc.role}
                      onChange={(role) => handleChangeRole(doc.id, role)}
                      allRoles={Array.from(new Set(docs.map(d => d.role)))}
                    />
                  </div>

                  {/* Size + date */}
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "#334155" }}>{formatSize(doc.fileSize)}</span>
                    <span style={{ fontSize: 11, color: "#334155" }}>{formatDate(doc.createdAt)}</span>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: 8, paddingTop: 4, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    <button onClick={() => handleDownload(doc)} title="Download"
                      style={{
                        flex: 1, padding: "7px", display: "flex", alignItems: "center",
                        justifyContent: "center", gap: 5,
                        background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)",
                        borderRadius: 8, color: "#38bdf8", fontSize: 11, fontWeight: 600, cursor: "pointer",
                      }}>
                      <Download size={12} /> Download
                    </button>
                    <button onClick={() => startRename(doc)} title="Rename"
                      style={{
                        padding: "7px 10px", display: "flex", alignItems: "center",
                        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 8, color: "#94a3b8", cursor: "pointer",
                      }}>
                      <Edit3 size={13} />
                    </button>
                    <button onClick={() => handleDelete(doc.id)} title="Delete"
                      style={{
                        padding: "7px 10px", display: "flex", alignItems: "center",
                        background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                        borderRadius: 8, color: "#f87171", cursor: "pointer",
                      }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* #RENAME-MODAL ──────────────────────────────────────── */}
      {renameDoc && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center",
          alignItems: "center", zIndex: 300, backdropFilter: "blur(4px)",
        }}>
          <div style={{
            background: "#0d1525", padding: 28, borderRadius: 16, width: 380,
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>Rename Document</h3>
              <button onClick={() => setRenameDoc(null)}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <input
              value={renameVal}
              onChange={(e) => setRenameVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveRename(); if (e.key === "Escape") setRenameDoc(null); }}
              autoFocus
              style={{ ...inputStyle, marginBottom: 16 }}
              placeholder="Document name"
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={saveRename} style={{
                flex: 1, padding: "10px", background: "#22c55e", border: "none",
                borderRadius: 8, color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}>Save</button>
              <button onClick={() => setRenameDoc(null)} style={{
                flex: 1, padding: "10px", background: "#1e293b", border: "none",
                borderRadius: 8, color: "#94a3b8", fontWeight: 600, fontSize: 13, cursor: "pointer",
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

// ── Inline role editor component ──────────────────────────────
// Click the role tag on a card to edit it inline.
function RoleEditor({ value, onChange, allRoles }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal]         = useState(value);
  const inputRef              = useRef(null);

  const save = () => {
    const trimmed = val.trim();
    if (trimmed) onChange(trimmed);
    else setVal(value);
    setEditing(false);
  };

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  if (!editing) {
    return (
      <span
        onClick={() => { setEditing(true); setVal(value); }}
        title="Click to change role"
        style={{
          fontSize: 11, padding: "3px 10px", borderRadius: 20, cursor: "pointer",
          background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)",
          color: "#818cf8", fontWeight: 600,
        }}
      >
        {value} ✎
      </span>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <input
        ref={inputRef}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
        style={{ ...inputStyle, width: 140, padding: "4px 8px", fontSize: 11, borderRadius: 6 }}
        list="role-suggestions"
      />
      <datalist id="role-suggestions">
        {allRoles.map(r => <option key={r} value={r} />)}
      </datalist>
      <button onClick={save} style={{ background: "none", border: "none", color: "#4ade80", cursor: "pointer", padding: 2 }}>
        <Check size={14} />
      </button>
      <button onClick={() => setEditing(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: 2 }}>
        <X size={14} />
      </button>
    </div>
  );
}

export default Documents;