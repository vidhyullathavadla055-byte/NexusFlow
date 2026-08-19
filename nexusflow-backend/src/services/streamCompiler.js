import { combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { telemetryForDevice } from "./telemetryBus.js";
import { rollingAverage, threshold, derivative } from "./operators/customOperators.js";

/**
 * The Stream Compiler.
 *
 * Takes the exact JSON shape produced by the React Flow canvas —
 *   { nodes: [{ id, type, data }], edges: [{ id, source, target }] }
 * — and walks it into a graph of live RxJS Observables, rooted at every
 * "Data Source" node and terminating at every "Action Trigger" node.
 *
 * No polling: every node is a `pipe()` over the shared telemetry$ bus, so a
 * deployed graph reacts to hardware data the instant it's pushed onto the
 * bus by the Ingestion API.
 */
export function compileGraph(graph) {
  const nodesById = new Map(graph.nodes.map((n) => [n.id, n]));
  const incomingByTarget = new Map();
  for (const edge of graph.edges) {
    const list = incomingByTarget.get(edge.target) || [];
    list.push(edge.source);
    incomingByTarget.set(edge.target, list);
  }

  const cache = new Map();
  const visiting = new Set();

  function build(nodeId) {
    if (cache.has(nodeId)) return cache.get(nodeId);
    if (visiting.has(nodeId)) {
      throw new Error(`Stream Compiler: cycle detected at node "${nodeId}" — rule graphs must be acyclic.`);
    }
    visiting.add(nodeId);

    const node = nodesById.get(nodeId);
    if (!node) throw new Error(`Stream Compiler: edge references missing node "${nodeId}".`);

    let obs$;

    if (node.type === "dataSource") {
      obs$ = buildDataSource(node);
    } else {
      const upstreamIds = incomingByTarget.get(nodeId) || [];
      if (upstreamIds.length === 0) {
        throw new Error(`Stream Compiler: node "${node.data?.label || nodeId}" has no input connected.`);
      }
      const upstreams = upstreamIds.map(build);
      const merged = upstreams.length > 1 ? combineLatest(upstreams) : upstreams[0];

      if (node.type === "mathOp") {
        obs$ = buildMathOp(merged, node);
      } else if (node.type === "action") {
        obs$ = merged; // pass-through — subscription/side-effect happens in the runner
      } else {
        throw new Error(`Stream Compiler: unknown node type "${node.type}".`);
      }
    }

    visiting.delete(nodeId);
    cache.set(nodeId, obs$);
    return obs$;
  }

  const actionNodes = graph.nodes.filter((n) => n.type === "action");
  if (actionNodes.length === 0) {
    throw new Error("Stream Compiler: graph has no Action Trigger node — nothing would ever fire.");
  }

  // { node, observable } pairs the caller subscribes to.
  return actionNodes.map((node) => ({ node, observable: build(node.id) }));
}

function buildDataSource(node) {
  const { deviceId } = node.data;
  if (!deviceId) throw new Error(`Stream Compiler: Data Source "${node.data?.label}" has no deviceId configured.`);
  // Day 11 — subscribe directly to this device's own routed stream instead
  // of filtering the global firehose; see telemetryBus.js for why.
  return telemetryForDevice(deviceId).pipe(map((reading) => reading.value));
}

function buildMathOp(source$, node) {
  const { operation, window } = node.data;
  switch (operation) {
    case "Moving Average":
      return source$.pipe(rollingAverage(Number(window) || 10));
    case "Threshold >":
    case "Threshold <":
      return source$.pipe(threshold(operation, Number(window)));
    case "Derivative":
      return source$.pipe(derivative());
    default:
      throw new Error(`Stream Compiler: unknown Math Operation "${operation}".`);
  }
}
