import "./Dashboard.css";

function Activity() {
  const activities = [
    {
      id: 1,
      device: "Turbine Sensor",
      status: "Running",
      time: "10:15 AM",
    },
    {
      id: 2,
      device: "Pressure Sensor",
      status: "Warning",
      time: "10:30 AM",
    },
    {
      id: 3,
      device: "Temperature Sensor",
      status: "Offline",
      time: "10:45 AM",
    },
  ];

  return (
    <div className="dash-main">
      <div className="dash-heading">
        <h1>Activity</h1>
        <p>Recent machine activities</p>
      </div>

      <table
        style={{
          width: "100%",
          background: "#fff",
          borderCollapse: "collapse",
          borderRadius: "8px",
        }}
      >
        <thead>
          <tr style={{ background: "#0f172a", color: "#fff" }}>
            <th style={{ padding: "12px" }}>Device</th>
            <th>Status</th>
            <th>Time</th>
          </tr>
        </thead>

        <tbody>
          {activities.map((item) => (
            <tr key={item.id}>
              <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                {item.device}
              </td>
              <td style={{ borderBottom: "1px solid #ddd" }}>
                {item.status}
              </td>
              <td style={{ borderBottom: "1px solid #ddd" }}>
                {item.time}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Activity;