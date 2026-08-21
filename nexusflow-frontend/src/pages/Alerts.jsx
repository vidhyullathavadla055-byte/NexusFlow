import { useState } from "react";
import "./Dashboard.css";

const initialAlerts = [
  {
    id: 1,
    message: "High Temperature",
    device: "Turbine Sensor",
    severity: "high",
  },
  {
    id: 2,
    message: "Low Pressure",
    device: "Boiler Unit",
    severity: "medium",
  },
  {
    id: 3,
    message: "Sensor Offline",
    device: "Machine 03",
    severity: "low",
  },
];

function Alerts() {
  const [alerts, setAlerts] = useState(initialAlerts);

  const resolveAlert = (id) => {
    setAlerts((currentAlerts) =>
      currentAlerts.filter((alert) => alert.id !== id)
    );
  };

  const criticalCount = alerts.filter(
    (alert) => alert.severity === "critical"
  ).length;

  const highCount = alerts.filter(
    (alert) => alert.severity === "high"
  ).length;

  const mediumCount = alerts.filter(
    (alert) => alert.severity === "medium"
  ).length;

  const lowCount = alerts.filter(
    (alert) => alert.severity === "low"
  ).length;

  return (
    <div className="page-shell">
      <div className="page-heading">
        <h1>Alerts</h1>
        <p>Monitor all active alerts.</p>
      </div>

      {/* Severity Summary */}
      <div className="alerts-summary">
        <div className="summary-chip summary-chip--critical">
          <span>Critical</span>
          <strong>{criticalCount}</strong>
        </div>

        <div className="summary-chip summary-chip--high">
          <span>High</span>
          <strong>{highCount}</strong>
        </div>

        <div className="summary-chip summary-chip--medium">
          <span>Medium</span>
          <strong>{mediumCount}</strong>
        </div>

        <div className="summary-chip summary-chip--low">
          <span>Low</span>
          <strong>{lowCount}</strong>
        </div>
      </div>

      {/* Alert List */}
      <div className="page-card">
        <div className="alerts-list-header">
          <h2>Active Alerts</h2>
          <span>{alerts.length} alerts</span>
        </div>

        {alerts.length === 0 ? (
          <div className="no-alerts">
            <h3>No active alerts</h3>
            <p>All alerts have been resolved.</p>
          </div>
        ) : (
          <ul className="alerts-list">
            {alerts.map((alert) => (
              <li
                key={alert.id}
                className={`alerts-item alerts-item--${alert.severity}`}
              >
                <span className="alerts-dot" />

                <span className="alerts-message">
                  {alert.message}
                </span>

                <span className="alerts-device">
                  {alert.device}
                </span>

                <span className={`severity-badge severity-${alert.severity}`}>
                  {alert.severity}
                </span>

                <button
                  className="resolve-btn"
                  onClick={() => resolveAlert(alert.id)}
                >
                  Resolve
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Alerts;