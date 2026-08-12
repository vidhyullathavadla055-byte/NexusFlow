import axios from "axios";
import http from "http";
import https from "https";
import fs from "fs";
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
const REPORT_PATH = args.report || null;

// Reuse TCP connections across requests instead of a new handshake per
// batch — at 20+ batches/sec this is the difference between hitting the
// target rate and falling behind on connection setup alone.
const client = axios.create({
  httpAgent: new http.Agent({ keepAlive: true, maxSockets: 64 }),
  httpsAgent: new https.Agent({ keepAlive: true, maxSockets: 64 }),
  timeout: 5000,
});

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

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

async function run() {
  console.log(`[simulate] target ${BASE_URL}/api/ingest/bulk`);
  console.log(`[simulate] ~${RATE} writes/sec · batch=${BATCH_SIZE} · every ${INTERVAL_MS.toFixed(1)}ms · ${DURATION_S}s total`);

  let totalWritten = 0;
  let windowWritten = 0;
  let errors = 0;
  let inFlight = 0;
  let backpressureWarnings = 0;
  const latencies = [];
  const start = Date.now();
  let finished = false;

  const statsTimer = setInterval(() => {
    console.log(`[simulate] ${windowWritten} writes/sec (total ${totalWritten}, errors ${errors}, in-flight ${inFlight})`);
    windowWritten = 0;
  }, 1000);

  const sendTimer = setInterval(async () => {
    if (inFlight > 0) {
      backpressureWarnings++;
      // still let it fire — we want to see how badly we're falling behind,
      // not silently mask it — but it's now visible in the final report.
    }
    const readings = makeBatch();
    const reqStart = Date.now();
    inFlight++;
    try {
      await client.post(`${BASE_URL}/api/ingest/bulk`, { readings });
      const latencyMs = Date.now() - reqStart;
      latencies.push(latencyMs);
      totalWritten += readings.length;
      windowWritten += readings.length;
    } catch (err) {
      errors++;
      console.error("[simulate] batch failed:", err.message);
    } finally {
      inFlight--;
    }
  }, INTERVAL_MS);

  function finish() {
    if (finished) return;
    finished = true;
    clearInterval(sendTimer);
    clearInterval(statsTimer);

    const elapsed = (Date.now() - start) / 1000;
    const sorted = [...latencies].sort((a, b) => a - b);
    const summary = {
      targetRatePerSec: RATE,
      batchSize: BATCH_SIZE,
      durationSec: Number(elapsed.toFixed(1)),
      totalReadings: totalWritten,
      avgWritesPerSec: Math.round(totalWritten / elapsed),
      errors,
      backpressureWarnings,
      latencyMs: {
        min: sorted[0] || 0,
        avg: sorted.length ? Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length) : 0,
        p95: percentile(sorted, 95),
        max: sorted[sorted.length - 1] || 0,
      },
      meetsTarget: totalWritten / elapsed >= RATE * 0.9, // within 10% of target
    };

    console.log(`\n[simulate] done — ${summary.totalReadings} readings in ${summary.durationSec}s (${summary.avgWritesPerSec}/sec avg), ${summary.errors} errors`);
    console.log(`[simulate] latency ms — min ${summary.latencyMs.min} · avg ${summary.latencyMs.avg} · p95 ${summary.latencyMs.p95} · max ${summary.latencyMs.max}`);
    if (backpressureWarnings > 0) {
      console.log(`[simulate] ⚠ ${backpressureWarnings} batch(es) fired while a previous one was still in flight — server may be the bottleneck at this rate.`);
    }
    console.log(`[simulate] target ${summary.meetsTarget ? "MET ✓" : "NOT MET ✗"} (${summary.avgWritesPerSec}/${summary.targetRatePerSec} writes/sec)`);

    if (REPORT_PATH) {
      fs.writeFileSync(REPORT_PATH, JSON.stringify(summary, null, 2));
      console.log(`[simulate] report written to ${REPORT_PATH}`);
    }

    process.exit(errors > 0 && summary.avgWritesPerSec < RATE * 0.5 ? 1 : 0);
  }

  // Ctrl+C during a long demo run should still print a summary, not just die.
  process.on("SIGINT", finish);
  setTimeout(finish, DURATION_S * 1000);
}

run();
