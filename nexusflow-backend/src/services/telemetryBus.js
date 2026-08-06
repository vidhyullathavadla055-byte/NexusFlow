import { Subject } from "rxjs";
import { share } from "rxjs/operators";

/**
 * telemetry$ is the single source of truth every compiled rule graph reads
 * from. The Ingestion API pushes readings in with `pushReading`, after
 * they've been persisted to the MongoDB time-series collection. Every
 * "Data Source" node in a compiled graph subscribes to this stream filtered
 * to its own deviceId, so one bus fans out to any number of active
 * pipelines without re-reading from the database.
 */
const subject = new Subject();

export const telemetry$ = subject.asObservable().pipe(share());

/**
 * @param {{deviceId:string, metric:string, unit:string, value:number, timestamp:number}} reading
 */
export function pushReading(reading) {
  subject.next(reading);
}
