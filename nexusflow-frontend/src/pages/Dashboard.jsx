import Canvas from "../components/Canvas";
import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-page">

      <div className="dashboard-heading">
        <h1>Dashboard</h1>
        <p>
          Monitor your pipelines, telemetry, alerts and connected devices.
        </p>
      </div>

      <div className="dashboard-kpi-grid">

        <div className="dashboard-kpi-card">
          <span className="dashboard-kpi-label">
            Active Pipelines
          </span>

          <strong className="dashboard-kpi-value">
            3
          </strong>

          <span className="dashboard-kpi-sub">
            Pipelines running
          </span>
        </div>

        <div className="dashboard-kpi-card">
          <span className="dashboard-kpi-label">
            Ingest Rate
          </span>

          <strong className="dashboard-kpi-value">
            1,240
          </strong>

          <span className="dashboard-kpi-sub">
            Events / sec
          </span>
        </div>

        <div className="dashboard-kpi-card">
          <span className="dashboard-kpi-label">
            Alerts
          </span>

          <strong className="dashboard-kpi-value">
            8
          </strong>

          <span className="dashboard-kpi-sub">
            Active alerts
          </span>
        </div>

        <div className="dashboard-kpi-card">
          <span className="dashboard-kpi-label">
            Devices Online
          </span>

          <strong className="dashboard-kpi-value">
            12
          </strong>

          <span className="dashboard-kpi-sub">
            Connected devices
          </span>
        </div>

      </div>

      <div className="dashboard-canvas-section">

        <div className="dashboard-section-heading">
          <h2>Pipeline Canvas</h2>

          <p>
            Drag sensors, filters and alert nodes onto the canvas to build a
            live rule pipeline.
          </p>
        </div>

        <Canvas />

      </div>

    </div>
  );
}

export default Dashboard;