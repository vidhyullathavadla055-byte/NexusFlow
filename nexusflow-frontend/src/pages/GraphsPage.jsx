import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import "./Dashboard.css"; // reuses .page-shell / .page-heading / .activity-table

const STATUS_CLASS = {
  running: "activity-status--running",
  draft: "activity-status--warning",
  stopped: "activity-status--offline",
};

function GraphsPage() {
  const { token } = useAuth();
  const [graphs, setGraphs] = useState([]);
  const [state, setState] = useState("loading"); // loading | ready | error

  useEffect(() => {
    let cancelled = false;
    api
      .listGraphs(token)
      .then((data) => {
        if (!cancelled) {
          setGraphs(data);
          setState("ready");
        }
      })
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="page-shell">
      <div className="page-heading">
        <h1>Your Pipelines</h1>
        <p>Every graph you've saved from the Pipeline Canvas — status, node count and when it last changed.</p>
      </div>

      {state === "loading" && <div className="page-card">Loading pipelines…</div>}
      {state === "error" && <div className="page-card">Couldn't load pipelines. Is the backend running?</div>}
      {state === "ready" && graphs.length === 0 && (
        <div className="page-card">No pipelines yet — build one on the Canvas and hit Deploy.</div>
      )}

      {state === "ready" && graphs.length > 0 && (
        <table className="activity-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Nodes</th>
              <th>Last updated</th>
            </tr>
          </thead>
          <tbody>
            {graphs.map((g) => (
              <tr key={g._id}>
                <td>{g.name}</td>
                <td>
                  <span className={`activity-status ${STATUS_CLASS[g.status] || STATUS_CLASS.draft}`}>
                    {g.status || "draft"}
                  </span>
                </td>
                <td>{g.nodes?.length ?? 0}</td>
                <td>{g.updatedAt ? new Date(g.updatedAt).toLocaleString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default GraphsPage;
