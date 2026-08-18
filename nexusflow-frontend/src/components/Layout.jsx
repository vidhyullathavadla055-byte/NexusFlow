import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import "./Layout.css";

function Layout() {
  const { user, logout } = useAuth();
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="layout">
      <Sidebar />

      <div className="layout-content">
        <header className="layout-topbar">
          <h2>NexusFlow</h2>

          <div className="layout-user">
            <span>{user?.name || "Guest"}</span>

            <span className="layout-avatar">{initial}</span>

            <button onClick={logout}>Logout</button>
          </div>
        </header>

        <main className="layout-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;