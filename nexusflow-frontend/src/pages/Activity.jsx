import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import "./Dashboard.css";

const STATUS_CLASS = {
  deploy: "activity-status--running",
  rule_trigger: "activity-status--warning",
  error: "activity-status--offline",
};

const TYPE_LABEL = {
  deploy: "Deploy",
  rule_trigger: "Rule Trigger",
  error: "Error",
};

function Activity() {
  const { token } = useAuth();
  const [entries, setEntries] = useState([]);
  const [state, setState] = useState("loading"); // loading | ready | error
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;
    api
      .listActivity(token)
      .then((data) => {
        if (!cancelled) {
          setEntries(data);
          setState("ready");
        }
      })
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
  }, [token]);

  const visible = filter === "all" ? entries : entries.filter((e) => e.type === filter);

  return (
    <div className="page-shell">
      <div className="page-heading">
        <h1>Activity</h1>
        <p>Deploys, rule triggers and pipeline errors — recorded live as they happen.</p>
      </div>

      <div className="activity-filters">
        {["all", "deploy", "rule_trigger", "error"].map((t) => (
          <button
            key={t}
            type="button"
            className={`activity-filter-btn ${filter === t ? "activity-filter-btn--active" : ""}`}
            onClick={() => setFilter(t)}
          >
            {t === "all" ? "All" : TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      <div className="page-card">
        {state === "loading" && "Loading activity…"}
        {state === "error" && "Couldn't load activity. Is the backend running?"}
        {state === "ready" && visible.length === 0 && "No activity recorded yet — deploy a pipeline to see events here."}

        {state === "ready" && visible.length > 0 && (
          <table className="activity-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Message</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => (
                <tr key={item._id}>
                  <td>
                    <span className={`activity-status ${STATUS_CLASS[item.type] ?? ""}`}>
                      {TYPE_LABEL[item.type] || item.type}
                    </span>
                  </td>
                  <td>{item.message}</td>
                  <td>{item.createdAt ? new Date(item.createdAt).toLocaleTimeString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Activity;
