import { useState } from "react";
import "./Dashboard.css";

  

const initialAlerts = [

    {
    id: 0,
    message: "Critical Temperature",
    device: "Turbine Sensor",
    severity: "critical",
  },
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
  const [alerts, setAlerts] = useState(() => {
  const savedAlerts = localStorage.getItem("nexusflowAlerts");

  return savedAlerts
    ? JSON.parse(savedAlerts)
    : initialAlerts;
});
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");

  const resolveAlert = (id) => {
  setAlerts((currentAlerts) => {
    const updatedAlerts = currentAlerts.map((alert) =>
      alert.id === id
        ? {
            ...alert,
            status: "resolved",
          }
        : alert
    );

    localStorage.setItem(
      "nexusflowAlerts",
      JSON.stringify(updatedAlerts)
    );

    return updatedAlerts;
  });
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

  const filteredAlerts = alerts.filter((alert) => {
    if (alert.status === "resolved") {
  return false;
}
    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
      search === "" ||
      alert.message.toLowerCase().includes(search) ||
      alert.device.toLowerCase().includes(search);

    const matchesSeverity =
      severityFilter === "all" ||
      alert.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });
  const resolvedAlerts = alerts.filter(
  (alert) => alert.status === "resolved"
);

  return (
    <div className="page-shell">
      <div className="page-heading">
        <h1>Alerts</h1>
        <p>Monitor all active alerts.</p>
      </div>

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
      <div className="alerts-controls">
        <input
          type="text"
          placeholder="Search alerts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="alerts-search"
        />

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="alerts-filter"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="page-card">
        <div className="alerts-list-header">
          <h2>Active Alerts</h2>
          <span>{filteredAlerts.length} alerts</span>
        </div>
        {resolvedAlerts.length > 0 && (
  <div className="page-card resolved-alerts">
    <div className="alerts-list-header">
      <h2>Resolved Alerts</h2>
      <span>{resolvedAlerts.length} alerts</span>
    </div>

    <ul className="alerts-list">
      {resolvedAlerts.map((alert) => (
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

          <span
            className={`severity-badge severity-${alert.severity}`}
          >
            {alert.severity}
          </span>

          <span className="resolved-badge">
          Resolved
          </span>
        </li>
      ))}
    </ul>
  </div>
)}

        {filteredAlerts.length === 0 ? (
          <div className="no-alerts">
            <h3>No matching alerts</h3>
            <p>Try changing your search or severity filter.</p>
          </div>
        ) : (
          <ul className="alerts-list">
            {filteredAlerts.map((alert) => (
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

                <span
                  className={`severity-badge severity-${alert.severity}`}
                >
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