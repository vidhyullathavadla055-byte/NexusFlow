import Canvas from "../components/Canvas";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

function Dashboard() {
  const { user, logout } = useAuth();
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="dash-shell">
      <header className="dash-topbar">
        <div className="dash-brand">
          <span className="dash-brand-mark" />
          NexusFlow
        </div>
        <div className="dash-user">
          <span className="dash-user-name">{user?.name || "Guest"}</span>
          <span className="dash-user-avatar">{initial}</span>
          <button type="button" className="dash-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dash-main">
        <div className="dash-heading">
          <h1>Pipeline Canvas</h1>
          <p>Drag sensors, filters and alert nodes onto the canvas to build a live rule pipeline.</p>
        </div>
        <Canvas />
      </main>
    </div>
  );
}

export default Dashboard;
