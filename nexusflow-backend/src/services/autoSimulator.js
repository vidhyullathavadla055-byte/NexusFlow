import { DEVICES } from "../data/deviceRegistry.js";
import { insertReading } from "../models/telemetryModel.js";
import { pushReading } from "./telemetryBus.js";
import { env } from "../config/env.js";

/**
 * Keeps the demo alive without a separate terminal window. Generates one
 * reading per device on an interval, writes it to the time-series
 * collection, and pushes it onto the same telemetry bus the Ingestion API
 * uses — so it behaves exactly like real hardware, just generated
 * in-process instead of over HTTP.
 *
 * Controlled by AUTO_SIMULATE / AUTO_SIMULATE_INTERVAL_MS in .env.
 * Turn it off once real sensors (or the standalone simulator script) are
 * feeding the system, so this doesn't fight with real data.
 */
let timer = null;
const state = Object.fromEntries(DEVICES.map((d) => [d.id, d.base]));

function nextValue(prev, device) {
  const drift = (Math.random() - 0.5) * device.noise;
  const pull = (device.base - prev) * 0.04;
  const spike = Math.random() < 0.012 ? device.noise * (2 + Math.random() * 3) : 0;
  return Math.max(0, prev + drift + pull + spike);
}

export function startAutoSimulator() {
  if (!env.autoSimulate) {
    console.log("[auto-simulate] disabled (AUTO_SIMULATE=false) — waiting for real ingestion.");
    return;
  }
  if (timer) return; // already running

  console.log(`[auto-simulate] generating live telemetry every ${env.autoSimulateIntervalMs}ms for ${DEVICES.length} devices`);

  timer = setInterval(async () => {
    for (const device of DEVICES) {
      const value = nextValue(state[device.id], device);
      state[device.id] = value;
      const reading = {
        deviceId: device.id,
        metric: device.metric,
        unit: device.unit,
        value: Number(value.toFixed(2)),
        timestamp: Date.now(),
      };
      try {
        await insertReading(reading);
        pushReading(reading);
      } catch (err) {
        console.error("[auto-simulate] failed to write reading:", err.message);
      }
    }
  }, env.autoSimulateIntervalMs);
}

export function stopAutoSimulator() {
  if (timer) clearInterval(timer);
  timer = null;
}
