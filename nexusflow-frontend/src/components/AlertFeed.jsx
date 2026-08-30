import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLiveTelemetry } from "../lib/useLiveTelemetry";
import { api } from "../lib/api";
import "./AlertFeed.css";

const SEVERITY_DOT = { critical: "var(--critical)", warning: "var(--amber-600)" };

function timeAgo(dateLike) {
  const seconds = Math.floor((Date.now() - new Date(dateLike).getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

function AlertFeed() {
  const { token } = useAuth();
  const { alerts: liveAlerts } = useLiveTelemetry();
  const [history, setHistory] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api
      .listAlerts(token)
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoaded(true));
  }, [token]);

  // Live alerts arrive newest-first; merge with the fetched history and
  // dedupe by _id so a live alert doesn't show up twice once history
  // eventually includes it too.
  const combined = [...liveAlerts, ...history].filter((a, i, arr) => arr.findIndex((x) => x._id === a._id) === i).slice(0, 8);

  return (
    <div className="alert-feed">
      <div className="alert-feed-head">
        <h3>Recent Alerts</h3>
        {liveAlerts.length > 0 && <span className="alert-feed-live-badge">live</span>}
      </div>

      {!loaded && <p className="alert-feed-empty">Loading…</p>}
      {loaded && combined.length === 0 && <p className="alert-feed-empty">No alerts yet — deploy a pipeline to see them here.</p>}

      <ul className="alert-feed-list">
        {combined.map((a) => (
          <li key={a._id} className="alert-feed-item">
            <span className="alert-feed-dot" style={{ background: SEVERITY_DOT[a.severity] || "var(--ink-400)" }} />
            <div className="alert-feed-body">
              <span className="alert-feed-title">{a.title}</span>
              <span className="alert-feed-meta">{timeAgo(a.createdAt)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AlertFeed;
