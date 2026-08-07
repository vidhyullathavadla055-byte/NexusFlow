import "./Dashboard.css";

function Alerts() {
  return (
    <div className="dash-main">
      <div className="dash-heading">
        <h1>Alerts</h1>
        <p>Monitor all active alerts.</p>
      </div>

      <div style={{ background: "#fff", padding: "20px", borderRadius: "10px" }}>
        <h3>🚨 Active Alerts</h3>

        <ul>
          <li>High Temperature - Turbine Sensor</li>
          <li>Low Pressure - Boiler Unit</li>
          <li>Sensor Offline - Machine 03</li>
        </ul>
      </div>
    </div>
  );
}

export default Alerts;