import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import "./Dashboard.css";

// Backend severities are "critical" | "warning" — map onto the existing
// .alerts-item--high/--medium/--low colour scheme.
const SEVERITY_CLASS = { critical: "high", warning: "medium" };
const CHIPS = ["all", "critical", "warning", "resolved"];

function Alerts() {
  const { token } = useAuth();
  const toast = useToast();
  const [alerts, setAlerts] = useState([]);
  const [state, setState] = useState("loading"); // loading | ready | error
  const [filter, setFilter] = useState("all");
  const [resolvingId, setResolvingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .listAlerts(token)
      .then((data) => {
        if (!cancelled) {
          setAlerts(data);
          setState("ready");
        }
      })
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleResolve(id) {
    setResolvingId(id);
    try {
      const updated = await api.resolveAlert(id, token);
      setAlerts((prev) => prev.map((a) => (a._id === id ? updated : a)));
    } catch (err) {
      toast.error(`Couldn't resolve alert: ${err.message}`);
    } finally {
      setResolvingId(null);
    }
  }

  const visible = alerts.filter((a) => {
    if (filter === "all") return true;
    if (filter === "resolved") return a.status === "resolved";
    return a.severity === filter && a.status !== "resolved";
  });

  return (
    <div className="page-shell">
      <div className="page-heading">
        <h1>Alerts</h1>
        <p>Monitor all active alerts fired by your deployed pipelines.</p>
      </div>

      <div className="activity-filters">
        {CHIPS.map((c) => (
          <button
            key={c}
            type="button"
            className={`activity-filter-btn ${filter === c ? "activity-filter-btn--active" : ""}`}
            onClick={() => setFilter(c)}
          >
            {c === "all" ? "All" : c[0].toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      <div className="page-card">
        {state === "loading" && "Loading alerts…"}
        {state === "error" && "Couldn't load alerts. Is the backend running?"}
        {state === "ready" && visible.length === 0 && "No alerts here — nothing has fired yet."}

        {state === "ready" && visible.length > 0 && (
          <ul className="alerts-list">
            {visible.map((a) => (
              <li
                key={a._id}
                className={`alerts-item alerts-item--${SEVERITY_CLASS[a.severity] || "medium"} ${
                  a.status === "resolved" ? "alerts-item--resolved" : ""
                }`}
              >
                <span className="alerts-dot" />
                <span className="alerts-message">{a.title || a.message}</span>
                <span className="alerts-device">{a.deviceId || a.actionType}</span>
                {a.status === "resolved" ? (
                  <span className="alerts-resolved-badge">Resolved</span>
                ) : (
                  <button
                    type="button"
                    className="alerts-resolve-btn"
                    onClick={() => handleResolve(a._id)}
                    disabled={resolvingId === a._id}
                  >
                    {resolvingId === a._id ? "Resolving…" : "Resolve"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Alerts;
