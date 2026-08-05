function Dashboard() {
  return (
    <div>
      <h1>NexusFlow Dashboard</h1>

      <div style={{ display: "flex", gap: "20px" }}>
        <div
          style={{
            border: "1px solid gray",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          Tasks
        </div>

        <div
          style={{
            border: "1px solid gray",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          Projects
        </div>

        <div
          style={{
            border: "1px solid gray",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          Team Members
        </div>
      </div>
    </div>
  );
}

export default Dashboard;