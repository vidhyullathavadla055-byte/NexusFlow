import "./Dashboard.css";

const alerts = [
  { id: 1, message: "High Temperature",  device: "Turbine Sensor", severity: "high" },
  { id: 2, message: "Low Pressure",      device: "Boiler Unit",    severity: "medium" },
  { id: 3, message: "Sensor Offline",    device: "Machine 03",     severity: "low" },
];

function Alerts() {
  return (
    <div className="page-shell">
      <div className="page-heading">
        <h1>Alerts</h1>
        <p>Monitor all active alerts.</p>
      </div>

      <div className="page-card">
        <ul className="alerts-list">
          {alerts.map((alert) => (
            <li key={alert.id} className={`alerts-item alerts-item--${alert.severity}`}>
              <span className="alerts-dot" />
              <span className="alerts-message">{alert.message}</span>
              <span className="alerts-device">{alert.device}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Alerts;
