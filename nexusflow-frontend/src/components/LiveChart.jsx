import { useMemo, useState } from "react";
import { useLiveTelemetry } from "../lib/useLiveTelemetry";
import "./LiveChart.css";

const STATUS_COLOR = {
  critical: "var(--critical)",
  warning: "var(--amber-600)",
  normal: "var(--cyan-700)",
};

function buildPath(points, width, height, min, max) {
  if (points.length < 2) return "";
  const range = max - min || 1;
  const step = width / (points.length - 1);
  return points
    .map((p, i) => {
      const x = i * step;
      const y = height - ((p.value - min) / range) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function LiveChart() {
  const { latestByDevice, history, connected } = useLiveTelemetry();
  const deviceIds = Object.keys(latestByDevice);
  const [selected, setSelected] = useState(null);

  const activeId = selected && deviceIds.includes(selected) ? selected : deviceIds[0];
  const latest = activeId ? latestByDevice[activeId] : null;
  const points = activeId ? history[activeId] || [] : [];

  const { path } = useMemo(() => {
    if (points.length < 2) return { path: "" };
    const values = points.map((p) => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = (max - min) * 0.15 || 1;
    return { path: buildPath(points, 100, 100, min - pad, max + pad) };
  }, [points]);

  return (
    <div className="live-chart">
      <div className="live-chart-head">
        <div>
          <span className="live-chart-eyebrow">
            <span className={`live-dot ${connected ? "live-dot--on" : ""}`} />
            Live Telemetry
          </span>
          {deviceIds.length > 0 && (
            <select className="live-chart-select" value={activeId} onChange={(e) => setSelected(e.target.value)}>
              {deviceIds.map((id) => (
                <option key={id} value={id}>
                  {latestByDevice[id].label}
                </option>
              ))}
            </select>
          )}
        </div>

        {latest && (
          <div className="live-chart-value" style={{ color: STATUS_COLOR[latest.status] || "var(--ink-900)" }}>
            <span className="mono">{latest.value.toFixed(1)}</span>
            <span className="live-chart-unit">{latest.unit}</span>
          </div>
        )}
      </div>

      {points.length < 2 ? (
        <div className="live-chart-empty">
          {connected ? "Waiting for the next reading…" : "Reconnecting to the live stream…"}
        </div>
      ) : (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="live-chart-svg">
          <path d={path} fill="none" stroke={STATUS_COLOR[latest?.status] || "var(--cyan-700)"} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
        </svg>
      )}
    </div>
  );
}

export default LiveChart;
