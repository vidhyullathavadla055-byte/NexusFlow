import "./Dashboard.css";

function Settings() {
  return (
    <div className="dash-main">
      <div className="dash-heading">
        <h1>Settings</h1>
        <p>Manage your application settings.</p>
      </div>

      <div style={{ background: "#fff", padding: "20px", borderRadius: "10px" }}>
        <h3>Profile Settings</h3>

        <p>Name: Akshaya</p>
        <p>Email: akshaya@example.com</p>

        <button
          style={{
            marginTop: "15px",
            padding: "10px 20px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default Settings;