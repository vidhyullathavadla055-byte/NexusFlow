import { useState } from "react";
import "./Alerts.css";

const STATUS_CLASS = {
  Running: "activity-status--running",
  Warning: "activity-status--warning",
  Offline: "activity-status--offline",
};

const activities = [
  { id: 1, device: "Turbine Sensor",      status: "Running", time: "10:15 AM" },
  { id: 2, device: "Pressure Sensor",     status: "Warning", time: "10:30 AM" },
  { id: 3, device: "Temperature Sensor",  status: "Offline", time: "10:45 AM" },
];

function Activity() {
  return (
    <div className="page-shell">
      <div className="page-heading">
        <h1>Activity</h1>
        <p>Recent machine activities</p>
      </div>

      <div className="page-card">
        <table className="activity-table">
          <thead>
            <tr>
              <th>Device</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((item) => (
              <tr key={item.id}>
                <td>{item.device}</td>
                <td>
                  <span className={`activity-status ${STATUS_CLASS[item.status] ?? ""}`}>
                    {item.status}
                  </span>
                </td>
                <td>{item.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Activity;
