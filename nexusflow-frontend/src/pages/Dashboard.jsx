import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLiveTelemetry } from "../lib/useLiveTelemetry";
import { api } from "../lib/api";
import LiveChart from "../components/LiveChart";
import AlertFeed from "../components/AlertFeed";
import "./Dashboard.css";

function isToday(dateLike) {
  if (!dateLike) return false;
  const d = new Date(dateLike);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function Dashboard() {
  const { token } = useAuth();
  const [kpis, setKpis] = useState({
    activePipelines: null,
    totalPipelines: null,
    ingestRate: null,
    alertsToday: null,
    devicesOnline: null,
  });

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([api.listGraphs(token), api.getTelemetryStats(token), api.listAlerts(token), api.getDevices()]).then(
      ([graphsRes, statsRes, alertsRes, devicesRes]) => {
        if (cancelled) return;

        const graphs = graphsRes.status === "fulfilled" ? graphsRes.value : [];
        const stats = statsRes.status === "fulfilled" ? statsRes.value : null;
        const alerts = alertsRes.status === "fulfilled" ? alertsRes.value : [];
        const devices = devicesRes.status === "fulfilled" ? devicesRes.value : [];

        setKpis({
          activePipelines: graphs.filter((g) => g.status === "running").length,
          totalPipelines: graphs.length,
          ingestRate: stats ? stats.totalReadings : null,
          alertsToday: alerts.filter((a) => isToday(a.createdAt)).length,
          devicesOnline: devices.length,
        });
      }
    );

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <h1>Dashboard</h1>
        <p>A live snapshot of your NexusFlow deployment.</p>
      </div>

      <div className="kpi-grid">
        <KpiCard label="Active Pipelines" value={kpis.activePipelines} sub={`${kpis.totalPipelines ?? 0} total`} />
        <KpiCard label="Ingest Rate" value={kpis.ingestRate} sub="readings stored" />
        <KpiCard label="Alerts Today" value={kpis.alertsToday} sub="fired in the last 24h" />
        <KpiCard label="Devices Online" value={kpis.devicesOnline} sub="registered sensors" />
      </div>

      <div className="dashboard-live-grid">
        <LiveChart />
        <AlertFeed />
      </div>

      <div className="page-card dashboard-cta">
        <div>
          <h3>Build or edit a pipeline</h3>
          <p>Drag sensors, filters and alert nodes onto the canvas to build a live rule pipeline.</p>
        </div>
        <div className="dashboard-cta-actions">
          <Link to="/canvas" className="settings-save-btn">
            Open Canvas
          </Link>
          <Link to="/pipelines" className="dashboard-cta-secondary">
            View all pipelines →
          </Link>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub }) {
  return (
    <div className="kpi-card">
      <span className="kpi-label">{label}</span>
      <span className="kpi-value mono">{value ?? "—"}</span>
      <span className="kpi-sub">{sub}</span>
    </div>
  );
}

export default Dashboard;
