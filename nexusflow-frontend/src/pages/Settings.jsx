import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

function Settings() {
  const { user } = useAuth();

  return (
    <div className="page-shell">
      <div className="page-heading">
        <h1>Settings</h1>
        <p>Manage your application settings.</p>
      </div>

      <div className="page-card">
        <h3 style={{ margin: "0 0 16px", color: "#0f172a", fontSize: "16px", fontWeight: 700 }}>
          Profile Settings
        </h3>

        <p style={{ margin: "0 0 8px", fontSize: "14px", color: "#334155" }}>
          <strong>Name:</strong> {user?.name || "—"}
        </p>
        <p style={{ margin: "0 0 20px", fontSize: "14px", color: "#334155" }}>
          <strong>Email:</strong> {user?.email || "—"}
        </p>

        <button className="settings-save-btn">Save Changes</button>
      </div>
    </div>
  );
}

export default Settings;
