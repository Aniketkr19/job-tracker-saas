import { useEffect, useState, useRef } from "react";
import API from "../../api/axios";
import AppLayout from "../../components/layout/AppLayout";

// ============================================================
// THEME — put this in your index.js or App.jsx entry point:
//
//   import { ThemeProvider } from "./context/ThemeContext";
//   <ThemeProvider><App /></ThemeProvider>
//
// OR if you don't want a context, the theme toggle below
// works standalone using localStorage + data-theme on <body>.
// ============================================================

function Profile() {

  // ── Existing state ──────────────────────────────────────
  const [user, setUser]                       = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading]             = useState(false);
  const [toast, setToast]                     = useState(null);
  const [showCurrent, setShowCurrent]         = useState(false);
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);

  // ── [FEATURE 1] Edit Name ────────────────────────────────
  // Location → User Info Card, inline next to name
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName]       = useState("");
  const [isSavingName, setIsSavingName]   = useState(false);

  // ── [FEATURE 2] Profile Photo ────────────────────────────
  // Location → User Info Card, overlay button on avatar circle
  // Requires backend: PUT /users/upload-avatar (multipart/form-data)
  // Backend should return: { avatarUrl: "https://..." }
  const [avatarUrl, setAvatarUrl] = useState(
  () => localStorage.getItem("avatarUrl") || null
);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef                            = useRef(null);

  // ── [FEATURE 3] Theme Toggle ─────────────────────────────
  // Location → Top-right of page header
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );

  // ── [FEATURE 4] Delete Account ───────────────────────────
  // Location → Danger Zone card at the very bottom of page
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput]             = useState("");
  const [isDeleting, setIsDeleting]               = useState(false);

  // ── Apply theme to <body> on change ─────────────────────
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // ── Fetch profile on mount ───────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      const res = await API.get("/users/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      localStorage.setItem("userEmail", res.data.email);
      setEditedName(res.data.name);
      localStorage.setItem("userName", res.data.name);
      // [FEATURE 2] If backend returns avatarUrl, populate it
      // TO THIS — always sync localStorage with what backend returns
if (res.data.avatarUrl) {
  setAvatarUrl(res.data.avatarUrl);
  localStorage.setItem("avatarUrl", res.data.avatarUrl); // ← ADD THIS
}
    };
    fetchProfile();
  }, []);

  // ── Helpers ──────────────────────────────────────────────
  const getInitials = (name = "") =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  // [FEATURE 3] Format createdAt — e.g. "January 15, 2024"
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric"
    });
  };

  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const levels = [
      { label: "Too weak",     color: "#ef4444" },
      { label: "Weak",         color: "#f97316" },
      { label: "Fair",         color: "#eab308" },
      { label: "Strong",       color: "#22c55e" },
      { label: "Very strong",  color: "#16a34a" },
    ];
    return { score, ...levels[score] };
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const strength          = getPasswordStrength(newPassword);
  const passwordsMatch    = newPassword && confirmPassword && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword && newPassword !== confirmPassword;
  const isFormValid       = currentPassword.trim() && newPassword.length >= 8 && passwordsMatch;

  // ── [FEATURE 1] Save Name ────────────────────────────────
  // Add this route to your backend: PUT /users/update-name
  // Body: { name: string }
  const handleSaveName = async () => {
    if (!editedName.trim() || editedName === user.name) {
      setIsEditingName(false);
      return;
    }
    setIsSavingName(true);
    const token = localStorage.getItem("token");
    try {
      await API.put(
        "/users/update-name",
        { name: editedName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser((prev) => ({ ...prev, name: editedName.trim() }));
      localStorage.setItem("userName", editedName.trim());
      setIsEditingName(false);
      showToast("success", "Name updated!");
    } catch {
      showToast("error", "Failed to update name.");
    } finally {
      setIsSavingName(false);
    }
  };

  // ── [FEATURE 2] Upload Photo ─────────────────────────────
  // Add this route to your backend: PUT /users/upload-avatar
  // Use multer middleware for file handling
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("error", "Please select an image file.");
      return;
    }
    setIsUploadingPhoto(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await API.put("/users/upload-avatar", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });
      setAvatarUrl(res.data.avatarUrl);
       localStorage.setItem("avatarUrl", res.data.avatarUrl);
      showToast("success", "Profile photo updated!");
    } catch {
      showToast("error", "Failed to upload photo.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // ── Existing: Update Password ────────────────────────────
  const handleUpdatePassword = async () => {
    if (!isFormValid) return;
    setIsLoading(true);
    const token = localStorage.getItem("token");
    try {
      await API.put(
        "/users/change-password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("success", "Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      showToast("error", "Current password is incorrect. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── [FEATURE 4] Delete Account ───────────────────────────
  // Add this route to your backend: DELETE /users/delete-account
  // Should delete user + all their jobs, then return 200
  const handleDeleteAccount = async () => {
    if (deleteInput !== "DELETE") return;
    setIsDeleting(true);
    const token = localStorage.getItem("token");
    try {
      await API.delete("/users/delete-account", {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch {
      showToast("error", "Failed to delete account. Try again.");
      setIsDeleting(false);
    }
  };

  // ── Theme tokens ─────────────────────────────────────────
  const t = theme === "dark" ? darkTheme : lightTheme;

  if (!user) {
    return (
      <AppLayout>
        <div style={styles.loadingWrap}>
          <div style={styles.spinner} />
          <p style={{ ...styles.loadingText, color: t.textMuted }}>Loading profile...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={styles.page}>

        {/* ─────────────────────────────────────────
            PAGE HEADER
            [FEATURE 3] Theme toggle — top right
        ───────────────────────────────────────── */}
        <div style={styles.pageHeader}>
          <h2 style={{ ...styles.pageTitle, color: t.textPrimary }}>Profile</h2>
          <button
            style={{ ...styles.themeToggle, background: t.cardBg, border: `1px solid ${t.border}`, color: t.textPrimary }}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* Global Toast */}
        {toast && (
          <div style={{
            ...styles.toast,
            background:  toast.type === "success" ? "#14532d" : "#450a0a",
            borderColor: toast.type === "success" ? "#16a34a" : "#dc2626",
            color:       toast.type === "success" ? "#86efac" : "#fca5a5",
            marginBottom: 16,
          }}>
            {toast.message}
          </div>
        )}

        {/* ─────────────────────────────────────────
            CARD 1 — User Info
            [FEATURE 1] Edit name — pencil icon next to name
            [FEATURE 2] Photo upload — camera icon on avatar
            [FEATURE 3] Created date — below email
        ───────────────────────────────────────── */}
        <div style={{ ...styles.card, background: t.cardBg, border: `1px solid ${t.border}` }}>
          <div style={styles.userRow}>

            {/* Avatar with upload overlay */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ ...styles.avatar, background: avatarUrl ? "transparent" : "#1d4ed8", overflow: "hidden" }}>
                {avatarUrl
                  ? <img src={avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : getInitials(user.name)
                }
              </div>
              {/* [FEATURE 2] Click avatar to open file picker */}
              <button
                style={styles.avatarUploadBtn}
                onClick={() => fileInputRef.current.click()}
                title="Change photo"
              >
                {isUploadingPhoto ? "…" : "📷"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handlePhotoUpload}
              />
            </div>

            {/* Name / Email / Meta */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* [FEATURE 1] Name — toggles between display and edit mode */}
              {isEditingName ? (
                <div style={styles.nameEditRow}>
                  <input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                    autoFocus
                    style={{ ...styles.nameInput, background: t.inputBg, color: t.textPrimary, border: `1px solid ${t.border}` }}
                  />
                  <button style={styles.saveNameBtn} onClick={handleSaveName}>
                    {isSavingName ? "…" : "✓"}
                  </button>
                  <button style={styles.cancelNameBtn} onClick={() => { setIsEditingName(false); setEditedName(user.name); }}>
                    ✕
                  </button>
                </div>
              ) : (
                <div style={styles.nameRow}>
                  <p style={{ ...styles.userName, color: t.textPrimary }}>{user.name}</p>
                  <button style={styles.editNameBtn} onClick={() => setIsEditingName(true)} title="Edit name">✏️</button>
                </div>
              )}

              <p style={{ ...styles.userEmail, color: t.textMuted }}>{user.email}</p>

              <div style={styles.metaRow}>
                <span style={styles.badge}>Active</span>
                {/* [FEATURE 3] Show account created date — comes from user.createdAt */}
                {user.createdAt && (
                  <span style={{ fontSize: 11, color: t.textMuted }}>
                    Joined {formatDate(user.createdAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────
            CARD 2 — Change Password (existing)
        ───────────────────────────────────────── */}
        <div style={{ ...styles.card, background: t.cardBg, border: `1px solid ${t.border}` }}>
          <p style={styles.sectionTitle}>Change Password</p>

          <div style={styles.fieldGroup}>
            <label style={{ ...styles.label, color: t.textSecondary }}>Current Password</label>
            <div style={styles.inputWrap}>
              <input
                type={showCurrent ? "text" : "password"}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{ ...styles.input, background: t.inputBg, color: t.textPrimary, borderColor: t.border }}
              />
              <button style={styles.eyeBtn} onClick={() => setShowCurrent(!showCurrent)}>
                {showCurrent ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={{ ...styles.label, color: t.textSecondary }}>New Password</label>
            <div style={styles.inputWrap}>
              <input
                type={showNew ? "text" : "password"}
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ ...styles.input, background: t.inputBg, color: t.textPrimary, borderColor: t.border }}
              />
              <button style={styles.eyeBtn} onClick={() => setShowNew(!showNew)}>
                {showNew ? "🙈" : "👁️"}
              </button>
            </div>
            {newPassword.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={styles.strengthBar}>
                  <div style={{ ...styles.strengthFill, width: `${(strength.score / 4) * 100}%`, background: strength.color }} />
                </div>
                <p style={{ ...styles.strengthLabel, color: strength.color }}>{strength.label}</p>
              </div>
            )}
          </div>

          <div style={styles.fieldGroup}>
            <label style={{ ...styles.label, color: t.textSecondary }}>Confirm New Password</label>
            <div style={styles.inputWrap}>
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  ...styles.input,
                  background: t.inputBg,
                  color: t.textPrimary,
                  borderColor: passwordsMismatch ? "#ef4444" : passwordsMatch ? "#22c55e" : t.border,
                }}
              />
              <button style={styles.eyeBtn} onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? "🙈" : "👁️"}
              </button>
            </div>
            {passwordsMismatch && <p style={{ ...styles.hint, color: "#ef4444" }}>Passwords do not match</p>}
            {passwordsMatch    && <p style={{ ...styles.hint, color: "#22c55e" }}>Passwords match ✓</p>}
          </div>

          <button
            onClick={handleUpdatePassword}
            disabled={!isFormValid || isLoading}
            style={{
              ...styles.submitBtn,
              opacity: !isFormValid || isLoading ? 0.5 : 1,
              cursor:  !isFormValid || isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </div>

        {/* ─────────────────────────────────────────
            CARD 3 — Danger Zone
            [FEATURE 4] Delete account — bottom of page
            User must type DELETE to confirm
        ───────────────────────────────────────── */}
        <div style={styles.dangerCard}>
          <p style={styles.sectionTitle}>Danger Zone</p>

          {!showDeleteConfirm ? (
            <div style={styles.dangerRow}>
              <div>
                <p style={styles.dangerTitle}>Delete Account</p>
                <p style={styles.dangerDesc}>
                  Permanently removes your account and all job data. This cannot be undone.
                </p>
              </div>
              <button style={styles.dangerBtn} onClick={() => setShowDeleteConfirm(true)}>
                Delete Account
              </button>
            </div>
          ) : (
            <div>
              <p style={styles.dangerDesc}>
                Type <strong style={{ color: "#ef4444" }}>DELETE</strong> below to confirm.
                All your jobs and data will be permanently removed.
              </p>
              <input
                type="text"
                placeholder='Type "DELETE" to confirm'
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                style={{ ...styles.input, background: "#1a0a0a", borderColor: "#7f1d1d", color: "white", marginTop: 10 }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button
                  style={{
                    ...styles.dangerBtn,
                    opacity: deleteInput !== "DELETE" || isDeleting ? 0.5 : 1,
                    cursor:  deleteInput !== "DELETE" || isDeleting ? "not-allowed" : "pointer",
                  }}
                  disabled={deleteInput !== "DELETE" || isDeleting}
                  onClick={handleDeleteAccount}
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete My Account"}
                </button>
                <button
                  style={styles.cancelDangerBtn}
                  onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}

// ════════════════════════════════════════════════
// THEME TOKENS — [FEATURE 3]
// ════════════════════════════════════════════════
const darkTheme = {
  cardBg:       "#1f2937",
  border:       "#374151",
  inputBg:      "#111827",
  textPrimary:  "#ffffff",
  textSecondary:"#d1d5db",
  textMuted:    "#9ca3af",
};

const lightTheme = {
  cardBg:       "#ffffff",
  border:       "#e5e7eb",
  inputBg:      "#f9fafb",
  textPrimary:  "#111827",
  textSecondary:"#374151",
  textMuted:    "#6b7280",
};

// ════════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════════
const styles = {
  page:       { maxWidth: 480, padding: "24px 16px" },
  pageHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  pageTitle:  { fontSize: 22, fontWeight: 600, margin: 0 },
  themeToggle:{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer" },
  card:       { borderRadius: 12, padding: "20px 24px", marginBottom: 16 },
  dangerCard: { borderRadius: 12, padding: "20px 24px", marginBottom: 16, background: "#1a0505", border: "1px solid #7f1d1d" },
  userRow:    { display: "flex", alignItems: "flex-start", gap: 14 },
  avatar:     { width: 56, height: 56, borderRadius: "50%", color: "#bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 600 },
  avatarUploadBtn: { position: "absolute", bottom: -2, right: -2, width: 22, height: 22, borderRadius: "50%", background: "#374151", border: "2px solid #111827", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 },
  nameRow:    { display: "flex", alignItems: "center", gap: 6, marginBottom: 2 },
  nameEditRow:{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 },
  nameInput:  { fontSize: 15, fontWeight: 600, padding: "4px 8px", borderRadius: 6, outline: "none", width: 160 },
  editNameBtn:{ background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: 0, opacity: 0.6 },
  saveNameBtn:{ background: "#16a34a", border: "none", color: "white", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 13, fontWeight: 600 },
  cancelNameBtn:{ background: "#374151", border: "none", color: "#d1d5db", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 13 },
  userName:   { fontSize: 16, fontWeight: 600, margin: 0 },
  userEmail:  { fontSize: 13, margin: "2px 0 6px" },
  metaRow:    { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  badge:      { fontSize: 11, padding: "2px 10px", borderRadius: 20, background: "#14532d", color: "#86efac", fontWeight: 500 },
  sectionTitle:{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 16px 0" },
  fieldGroup: { marginBottom: 16 },
  label:      { display: "block", fontSize: 13, marginBottom: 6, fontWeight: 500 },
  inputWrap:  { position: "relative" },
  input:      { width: "100%", padding: "10px 40px 10px 12px", border: "1px solid", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" },
  eyeBtn:     { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1 },
  strengthBar:{ height: 4, background: "#374151", borderRadius: 2, overflow: "hidden" },
  strengthFill:{ height: "100%", borderRadius: 2, transition: "width 0.3s, background 0.3s" },
  strengthLabel:{ fontSize: 12, marginTop: 4, fontWeight: 500 },
  hint:       { fontSize: 12, marginTop: 5 },
  toast:      { padding: "10px 14px", borderRadius: 8, fontSize: 13, border: "1px solid" },
  submitBtn:  { width: "100%", padding: "11px", background: "white", color: "#111827", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, transition: "opacity 0.2s" },
  dangerRow:  { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" },
  dangerTitle:{ fontSize: 14, fontWeight: 600, color: "#fca5a5", margin: "0 0 4px" },
  dangerDesc: { fontSize: 13, color: "#9ca3af", margin: 0 },
  dangerBtn:  { padding: "8px 16px", background: "#7f1d1d", color: "#fca5a5", border: "1px solid #dc2626", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0 },
  cancelDangerBtn:{ padding: "8px 16px", background: "#374151", color: "#d1d5db", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer" },
  loadingWrap:{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 60, gap: 12 },
  spinner:    { width: 28, height: 28, border: "3px solid #374151", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" },
  loadingText:{ fontSize: 14 },
};

export default Profile;