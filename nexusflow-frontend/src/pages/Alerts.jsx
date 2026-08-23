import { useEffect, useState } from "react";
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
  const [alerts, setAlerts] = useState(() => {
  const savedAlerts = localStorage.getItem("nexusflow_alerts");

  return savedAlerts ? JSON.parse(savedAlerts) : initialAlerts;
});
    const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");

   useEffect(() => {
    localStorage.setItem("nexusflow_alerts", JSON.stringify(alerts));
  }, [alerts]);

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
      const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.device.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      severityFilter === "all" ||
      alert.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });
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
              {/* Search and Filter */}
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
      {/* Alert List */}
      <div className="page-card">
        <div className="alerts-list-header">
          <h2>Active Alerts</h2>
          <span>{alerts.length} alerts</span>
        </div>

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