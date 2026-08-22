import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import Canvas from "../components/Canvas";
import "./Dashboard.css";

function Dashboard() {
  const [selectedMetric, setSelectedMetric] = useState("temperature");
  const [telemetryData, setTelemetryData] = useState([
  { time: "10:00", temperature: 70, pressure: 40 },
  { time: "10:05", temperature: 74, pressure: 44 },
  { time: "10:10", temperature: 78, pressure: 42 },
  { time: "10:15", temperature: 75, pressure: 48 },
  { time: "10:20", temperature: 82, pressure: 46 },
]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryData((currentData) => {
        const newTemperature = Math.floor(70 + Math.random() * 20);
const newPressure = Math.floor(40 + Math.random() * 15);

const newPoint = {
  time: new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
  temperature: newTemperature,
  pressure: newPressure,
};

        return [...currentData.slice(-5), newPoint];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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

      {/* Live Telemetry Chart */}

      <div className="dashboard-chart-section">

       <div className="dashboard-section-heading">

  <h2>Live Telemetry</h2>

  <p>
    Real-time monitoring from connected sensors.
  </p>

  <select
    value={selectedMetric}
    onChange={(e) => setSelectedMetric(e.target.value)}
    className="telemetry-select"
  >
    <option value="temperature">Temperature</option>
    <option value="pressure">Pressure</option>
  </select>

</div>

        <div className="dashboard-chart">

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={telemetryData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="time" />

              <YAxis />

              <Tooltip />

              <Line
  type="monotone"
  dataKey={selectedMetric}
  stroke="#2563eb"
  strokeWidth={3}
  dot={{ r: 4 }}
/>
            </LineChart>
          </ResponsiveContainer>

        </div>

      </div>

      {/* Pipeline Canvas */}

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