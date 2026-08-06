/**
 * Demo / load-test generator for the Mid Project Review's "Ingestion Audit":
 * drives the real /api/ingest/bulk endpoint hard enough to demonstrate the
 * time-series collection handling ~5,000 writes/sec.
 *
 * Usage:
 *   npm run simulate                     # defaults: 5000 writes/sec for 30s
 *   node src/scripts/simulateTelemetry.js --rate=8000 --duration=60
 */
import axios from "axios";
import "dotenv/config";
import { DEVICES } from "../data/deviceRegistry.js";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v];
  })
);

const RATE = Number(args.rate) || 5000; // target writes/sec across all devices
const DURATION_S = Number(args.duration) || 30;
const BATCH_SIZE = Number(args.batch) || 250; // readings per HTTP request
const BASE_URL = process.env.SIMULATOR_TARGET || `http://localhost:${process.env.PORT || 4000}`;
const BATCHES_PER_SEC = Math.max(1, Math.round(RATE / BATCH_SIZE));
const INTERVAL_MS = 1000 / BATCHES_PER_SEC;

const state = Object.fromEntries(DEVICES.map((d) => [d.id, d.base]));

function nextValue(prev, device) {
  const drift = (Math.random() - 0.5) * device.noise;
  const pull = (device.base - prev) * 0.04;
  const spike = Math.random() < 0.01 ? device.noise * (2 + Math.random() * 3) : 0;
  return Math.max(0, prev + drift + pull + spike);
}

function makeBatch() {
  const readings = [];
  for (let i = 0; i < BATCH_SIZE; i++) {
    const device = DEVICES[i % DEVICES.length];
    const value = nextValue(state[device.id], device);
    state[device.id] = value;
    readings.push({
      deviceId: device.id,
      metric: device.metric,
      unit: device.unit,
      value: Number(value.toFixed(2)),
      timestamp: Date.now(),
    });
  }
  return readings;
}

async function run() {
  console.log(`[simulate] target ${BASE_URL}/api/ingest/bulk`);
  console.log(`[simulate] ~${RATE} writes/sec · batch=${BATCH_SIZE} · every ${INTERVAL_MS.toFixed(1)}ms · ${DURATION_S}s total`);

  let totalWritten = 0;
  let windowWritten = 0;
  let errors = 0;
  const start = Date.now();

  const statsTimer = setInterval(() => {
    console.log(`[simulate] ${windowWritten} writes/sec (total ${totalWritten}, errors ${errors})`);
    windowWritten = 0;
  }, 1000);

  const sendTimer = setInterval(async () => {
    const readings = makeBatch();
    try {
      await axios.post(`${BASE_URL}/api/ingest/bulk`, { readings }, { timeout: 5000 });
      totalWritten += readings.length;
      windowWritten += readings.length;
    } catch (err) {
      errors++;
      console.error("[simulate] batch failed:", err.message);
    }
  }, INTERVAL_MS);

  setTimeout(() => {
    clearInterval(sendTimer);
    clearInterval(statsTimer);
    const elapsed = (Date.now() - start) / 1000;
    console.log(`\n[simulate] done — ${totalWritten} readings in ${elapsed.toFixed(1)}s (${(totalWritten / elapsed).toFixed(0)}/sec avg), ${errors} errors`);
    process.exit(0);
  }, DURATION_S * 1000);
}

run();
