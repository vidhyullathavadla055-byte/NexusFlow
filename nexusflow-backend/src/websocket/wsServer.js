import { WebSocketServer } from "ws";
import { telemetry$ } from "../services/telemetryBus.js";
import { getDevice } from "../data/deviceRegistry.js";

let wss;

/**
 * Attaches a WebSocket server to the existing HTTP server and starts
 * re-broadcasting every reading that lands on the telemetry bus, shaped to
 * match what the frontend's Live Dashboard expects
 * (see nexusflow-frontend/src/data/mockTelemetry.js).
 */
export function initWebSocket(httpServer) {
  wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (socket) => {
    console.log(`[ws] client connected — ${wss.clients.size} total`);
    socket.send(JSON.stringify({ type: "hello", payload: { message: "connected to NexusFlow stream" } }));

    socket.on("close", () => console.log(`[ws] client disconnected — ${wss.clients.size} total`));
  });

  telemetry$.subscribe((reading) => {
    const device = getDevice(reading.deviceId);
    const status = device ? statusFor(reading.value, device) : "normal";
    broadcast({
      type: "telemetry",
      payload: {
        deviceId: reading.deviceId,
        label: device?.label || reading.deviceId,
        metric: reading.metric,
        unit: reading.unit,
        value: reading.value,
        status,
        t: reading.timestamp || Date.now(),
      },
    });
  });

  return wss;
}

function statusFor(value, device) {
  if (value >= device.critical) return "critical";
  if (value >= device.warn) return "warning";
  return "normal";
}

export function broadcast(message) {
  if (!wss) return;
  const data = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) client.send(data);
  });
}
