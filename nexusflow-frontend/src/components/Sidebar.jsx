import { NavLink } from "react-router-dom";
import { useLiveTelemetry } from "../lib/useLiveTelemetry";
import "./Sidebar.css";

function Sidebar() {
  const { connected } = useLiveTelemetry();

  return (
    <aside className="sidebar">
      <h2 className="sidebar-brand">
        Nexus<span>Flow</span>
      </h2>

      <nav className="sidebar-nav">
        <NavLink to="/" end className="sidebar-link">
          Dashboard
        </NavLink>

        <NavLink to="/canvas" className="sidebar-link">
          Canvas
        </NavLink>

        <NavLink to="/pipelines" className="sidebar-link">
          Pipelines
        </NavLink>

        <NavLink to="/activity" className="sidebar-link">
          Activity
        </NavLink>

        <NavLink to="/alerts" className="sidebar-link">
          Alerts
        </NavLink>

        <NavLink to="/settings" className="sidebar-link">
          Settings
        </NavLink>
      </nav>

      <div className="sidebar-status">
        <span className={`sidebar-status-dot ${connected ? "sidebar-status-dot--on" : ""}`} />
        {connected ? "Live stream connected" : "Reconnecting…"}
      </div>
    </aside>
  );
}

export default Sidebar;
