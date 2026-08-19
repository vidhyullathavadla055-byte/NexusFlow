import { Subject } from "rxjs";
import { share } from "rxjs/operators";

/**
 * telemetry$ is the global firehose — every reading, from every device,
 * in order. Kept around for consumers that genuinely want everything
 * (the WebSocket broadcaster). The Ingestion API pushes readings in with
 * `pushReading`, after they've been persisted to the MongoDB time-series
 * collection.
 */
const subject = new Subject();
export const telemetry$ = subject.asObservable().pipe(share());

/**
 * Day 11 — performance pass.
 *
 * Compiled rule graphs used to subscribe to the global firehose and
 * `filter()` out everything except their own device. That means every
 * ingested reading did O(active Data Source nodes) work, even though a
 * given reading is only ever relevant to the handful of nodes watching
 * that specific device. At 5,000 writes/sec with dozens of deployed
 * pipelines, that's a lot of wasted filter() calls on every tick.
 *
 * Instead, route by device up front: one Subject per deviceId, so a
 * Data Source node subscribes directly to its own stream and a reading
 * only ever touches the subscribers that actually care about it — O(1)
 * dispatch per reading instead of O(pipelines).
 *
 * The device set is small and fixed (see data/deviceRegistry.js), so
 * this map stays bounded — it is not a candidate for unbounded growth.
 */
const perDeviceSubjects = new Map();

function getDeviceSubject(deviceId) {
  let deviceSubject = perDeviceSubjects.get(deviceId);
  if (!deviceSubject) {
    deviceSubject = new Subject();
    perDeviceSubjects.set(deviceId, deviceSubject);
  }
  return deviceSubject;
}

/**
 * Live stream of readings for a single device — what compiled Data
 * Source nodes should subscribe to instead of filtering telemetry$.
 * @param {string} deviceId
 */
export function telemetryForDevice(deviceId) {
  return getDeviceSubject(deviceId).asObservable();
}

/**
 * @param {{deviceId:string, metric:string, unit:string, value:number, timestamp:number}} reading
 */
export function pushReading(reading) {
  subject.next(reading); // global firehose — websocket broadcast etc.
  if (reading?.deviceId) {
    getDeviceSubject(reading.deviceId).next(reading); // O(1) routed dispatch
  }
}
