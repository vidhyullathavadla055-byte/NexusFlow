import { createContext, useEffect, useRef, useState } from "react";

export const LiveDataContext = createContext(null);

const HISTORY_LIMIT = 40; // points per device kept for the live chart
const ALERTS_LIMIT = 50;

function wsUrl() {
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
  return apiBase.replace(/^http/, "ws").replace(/\/api\/?$/, "") + "/ws";
}

export function LiveDataProvider({ children }) {
  const [connected, setConnected] = useState(false);
  const [latestByDevice, setLatestByDevice] = useState({});
  const [history, setHistory] = useState({}); // deviceId -> [{t, value}]
  const [alerts, setAlerts] = useState([]);
  const retryDelay = useRef(1000);

  useEffect(() => {
    let socket;
    let retryTimer;
    let cancelled = false;

    function connect() {
      socket = new WebSocket(wsUrl());

      socket.onopen = () => {
        setConnected(true);
        retryDelay.current = 1000; // reset backoff once a connection actually succeeds
      };

      socket.onmessage = (event) => {
        let msg;
        try {
          msg = JSON.parse(event.data);
        } catch {
          return; // ignore anything that isn't valid JSON rather than crash the UI
        }

        if (msg.type === "telemetry") {
          const reading = msg.payload;
          setLatestByDevice((prev) => ({ ...prev, [reading.deviceId]: reading }));
          setHistory((prev) => {
            const existing = prev[reading.deviceId] || [];
            const next = [...existing, { t: reading.t, value: reading.value }].slice(-HISTORY_LIMIT);
            return { ...prev, [reading.deviceId]: next };
          });
        } else if (msg.type === "alert") {
          setAlerts((prev) => [msg.payload, ...prev].slice(0, ALERTS_LIMIT));
        }
      };

      socket.onclose = () => {
        setConnected(false);
        if (cancelled) return;
        // Reconnect with capped exponential backoff — a dropped tab/network
        // blip shouldn't need a manual page refresh to see live data again.
        retryTimer = setTimeout(connect, retryDelay.current);
        retryDelay.current = Math.min(retryDelay.current * 2, 10000);
      };

      socket.onerror = () => socket.close(); // let onclose drive the single reconnect path
    }

    connect();

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      socket?.close();
    };
  }, []);

  const value = { connected, latestByDevice, history, alerts };
  return <LiveDataContext.Provider value={value}>{children}</LiveDataContext.Provider>;
}
