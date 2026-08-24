import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

function Settings() {
  const { user } = useAuth();

  const [pipelineName, setPipelineName] = useState(
    localStorage.getItem("nexusflow_pipeline_name") ||
      "Turbine Monitoring Pipeline"
  );

  const [autoSave, setAutoSave] = useState(
    localStorage.getItem("nexusflow_auto_save") === "true"
  );

  const [refreshRate, setRefreshRate] = useState(
    localStorage.getItem("nexusflow_refresh_rate") || "3000"
  );

  const [emailNotifications, setEmailNotifications] = useState(
    localStorage.getItem("nexusflow_email_notifications") !== "false"
  );

  const [alertNotifications, setAlertNotifications] = useState(
    localStorage.getItem("nexusflow_alert_notifications") !== "false"
  );

  const handleSaveChanges = () => {
    localStorage.setItem(
      "nexusflow_pipeline_name",
      pipelineName
    );

    localStorage.setItem(
      "nexusflow_auto_save",
      autoSave
    );

    localStorage.setItem(
      "nexusflow_refresh_rate",
      refreshRate
    );

    localStorage.setItem(
      "nexusflow_email_notifications",
      emailNotifications
    );

    localStorage.setItem(
      "nexusflow_alert_notifications",
      alertNotifications
    );

    alert("Settings saved successfully!");
  };

  return (
    <div className="page-shell">
      <div className="page-heading">
        <h1>Settings</h1>
        <p>Manage your application settings.</p>
      </div>

      {/* Profile Settings */}
      <div className="page-card">
        <h3
          style={{
            margin: "0 0 16px",
            color: "#0f172a",
            fontSize: "16px",
            fontWeight: 700,
          }}
        >
          Profile Settings
        </h3>

        <p
          style={{
            margin: "0 0 8px",
            fontSize: "14px",
            color: "#334155",
          }}
        >
          <strong>Name:</strong> {user?.name || "—"}
        </p>

        <p
          style={{
            margin: "0 0 20px",
            fontSize: "14px",
            color: "#334155",
          }}
        >
          <strong>Email:</strong> {user?.email || "—"}
        </p>
      </div>

      {/* Pipeline Settings */}
      <div
        className="page-card"
        style={{ marginTop: "20px" }}
      >
        <h3
          style={{
            margin: "0 0 20px",
            color: "#0f172a",
            fontSize: "16px",
            fontWeight: 700,
          }}
        >
          Pipeline Settings
        </h3>

        {/* Pipeline Name */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#334155",
            }}
          >
            Pipeline Name
          </label>

          <input
            type="text"
            value={pipelineName}
            onChange={(e) =>
              setPipelineName(e.target.value)
            }
            placeholder="Enter pipeline name"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Auto Save */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div>
            <strong
              style={{
                display: "block",
                color: "#334155",
                fontSize: "14px",
              }}
            >
              Auto Save
            </strong>

            <span
              style={{
                fontSize: "13px",
                color: "#64748b",
              }}
            >
              Automatically save pipeline changes
            </span>
          </div>

          <button
            type="button"
            onClick={() => setAutoSave(!autoSave)}
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer",
              background: autoSave
                ? "#16a34a"
                : "#94a3b8",
              color: "white",
              fontWeight: 600,
            }}
          >
            {autoSave ? "ON" : "OFF"}
          </button>
        </div>

        {/* Refresh Rate */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#334155",
            }}
          >
            Telemetry Refresh Rate
          </label>

          <select
            value={refreshRate}
            onChange={(e) =>
              setRefreshRate(e.target.value)
            }
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              fontSize: "14px",
              background: "white",
            }}
          >
            <option value="1000">1 second</option>
            <option value="3000">3 seconds</option>
            <option value="5000">5 seconds</option>
            <option value="10000">10 seconds</option>
          </select>
        </div>
      </div>

      {/* Notification Settings */}
      <div
        className="page-card"
        style={{ marginTop: "20px" }}
      >
        <h3
          style={{
            margin: "0 0 20px",
            color: "#0f172a",
            fontSize: "16px",
            fontWeight: 700,
          }}
        >
          Notification Settings
        </h3>

        {/* Email Notifications */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div>
            <strong
              style={{
                display: "block",
                color: "#334155",
                fontSize: "14px",
              }}
            >
              Email Notifications
            </strong>

            <span
              style={{
                fontSize: "13px",
                color: "#64748b",
              }}
            >
              Receive notifications through email
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              setEmailNotifications(
                !emailNotifications
              )
            }
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer",
              background: emailNotifications
                ? "#16a34a"
                : "#94a3b8",
              color: "white",
              fontWeight: 600,
            }}
          >
            {emailNotifications ? "ON" : "OFF"}
          </button>
        </div>

        {/* Alert Notifications */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <strong
              style={{
                display: "block",
                color: "#334155",
                fontSize: "14px",
              }}
            >
              Alert Notifications
            </strong>

            <span
              style={{
                fontSize: "13px",
                color: "#64748b",
              }}
            >
              Show notifications when alerts occur
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              setAlertNotifications(
                !alertNotifications
              )
            }
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer",
              background: alertNotifications
                ? "#16a34a"
                : "#94a3b8",
              color: "white",
              fontWeight: 600,
            }}
          >
            {alertNotifications ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ marginTop: "20px" }}>
        <button
          type="button"
          className="settings-save-btn"
          onClick={handleSaveChanges}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default Settings;