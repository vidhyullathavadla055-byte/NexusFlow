import { WebSocketServer } from "ws";
import { telemetry$ } from "../services/telemetryBus.js";
import { getDevice } from "../data/deviceRegistry.js";

let wss;

export function initWebSocket(httpServer) {
    wss = new WebSocketServer({ server: httpServer, path: "/ws" });

    // Same class of bug as the per-socket fix below, at the server level.
    wss.on("error", (err) => console.error(`[ws] server error:`, err.message));

    wss.on("connection", (socket) => {
        console.log(`[ws] client connected — ${wss.clients.size} total`);
        socket.send(
            JSON.stringify({
                type: "hello",
                payload: { message: "connected to NexusFlow stream" },
            }),
        );

        socket.on("close", () =>
            console.log(`[ws] client disconnected — ${wss.clients.size} total`),
        );

        // Day-3 fix: a WebSocket EventEmitter that gets an "error" event with
        // no listener throws — and an *unhandled* throw here crashes the
        // whole Node process, taking down every deployed rule pipeline for
        // every connected user, not just this one flaky client (e.g. a
        // mobile tab losing signal mid-connection). Handling it here just
        // logs and lets "close" do the normal cleanup.
        socket.on("error", (err) =>
            console.error(`[ws] socket error, dropping this client:`, err.message),
        );
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
        if (client.readyState !== client.OPEN) return;
        // Day-3 fix: send() can still throw even when readyState is OPEN
        // (e.g. socket half-closed a moment ago). One bad client shouldn't
        // stop this loop from reaching everyone else.
        try {
            client.send(data);
        } catch (err) {
            console.error(`[ws] failed to send to a client, skipping it:`, err.message);
        }
    });
}
