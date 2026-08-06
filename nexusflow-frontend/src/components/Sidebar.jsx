import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-logo">NexusFlow</h2>

      <nav className="sidebar-nav">
        <NavLink to="/" className="sidebar-link">
          Dashboard
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
    </aside>
  );
}

export default Sidebar;