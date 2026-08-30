import { useContext } from "react";
import { LiveDataContext } from "../context/LiveDataContext";

/**
 * WebSocket hook — subscribe to the live telemetry/alert stream from the
 * backend. Returns { connected, latestByDevice, history, alerts }.
 * Backed by LiveDataProvider (wraps <App/> once) so every consumer shares
 * a single socket instead of each opening its own connection.
 */
export function useLiveTelemetry() {
  const ctx = useContext(LiveDataContext);
  if (!ctx) throw new Error("useLiveTelemetry must be used within a LiveDataProvider");
  return ctx;
}
