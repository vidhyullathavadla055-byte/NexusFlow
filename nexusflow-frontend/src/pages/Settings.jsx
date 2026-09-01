import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import "./Dashboard.css";

function Settings() {
  const { user, token, updateUser } = useAuth();

  return (
    <div className="page-shell">
      <div className="page-heading">
        <h1>Settings</h1>
        <p>Manage your profile, password and notification channels.</p>
      </div>

      <ProfileCard user={user} token={token} onSaved={updateUser} />
      <PasswordCard token={token} />
      <NotificationsCard user={user} token={token} onSaved={updateUser} />
    </div>
  );
}

function ProfileCard({ user, token, onSaved }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [status, setStatus] = useState("idle"); // idle | saving | saved | error
  const [error, setError] = useState("");

  async function handleSave() {
    setStatus("saving");
    setError("");
    try {
      const updated = await api.updateProfile({ name, email }, token);
      onSaved(updated);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  }

  return (
    <div className="page-card">
      <h3 className="settings-card-title">Profile</h3>

      <label className="settings-field">
        <span>Name</span>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <label className="settings-field">
        <span>Email</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>

      {error && <p className="settings-error">{error}</p>}

      <button className="settings-save-btn" onClick={handleSave} disabled={status === "saving"}>
        {status === "saving" ? "Saving…" : status === "saved" ? "Saved ✓" : "Save Changes"}
      </button>
    </div>
  );
}

function PasswordCard({ token }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function handleChange() {
    setStatus("saving");
    setError("");
    try {
      await api.changePassword({ currentPassword, newPassword }, token);
      setCurrentPassword("");
      setNewPassword("");
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  }

  return (
    <div className="page-card">
      <h3 className="settings-card-title">Password</h3>

      <label className="settings-field">
        <span>Current password</span>
        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
      </label>

      <label className="settings-field">
        <span>New password</span>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      </label>

      {error && <p className="settings-error">{error}</p>}

      <button
        className="settings-save-btn"
        onClick={handleChange}
        disabled={status === "saving" || !currentPassword || !newPassword}
      >
        {status === "saving" ? "Updating…" : status === "saved" ? "Updated ✓" : "Change Password"}
      </button>
    </div>
  );
}

const CHANNELS = [
  { key: "sms", label: "SMS alerts" },
  { key: "email", label: "Email alerts" },
  { key: "webhook", label: "Webhook alerts" },
];

function NotificationsCard({ user, token, onSaved }) {
  const toast = useToast();
  const [prefs, setPrefs] = useState(user?.notifications || { sms: true, email: true, webhook: false });
  const [savingKey, setSavingKey] = useState(null);

  async function toggle(key) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setSavingKey(key);
    try {
      const updated = await api.updateNotifications({ [key]: next[key] }, token);
      onSaved(updated);
    } catch (err) {
      setPrefs(prefs); // revert on failure
      toast.error(`Couldn't update notifications: ${err.message}`);
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="page-card">
      <h3 className="settings-card-title">Notification Channels</h3>

      {CHANNELS.map(({ key, label }) => (
        <label key={key} className="settings-toggle-row">
          <span>{label}</span>
          <input type="checkbox" checked={!!prefs[key]} disabled={savingKey === key} onChange={() => toggle(key)} />
        </label>
      ))}
    </div>
  );
}

export default Settings;
