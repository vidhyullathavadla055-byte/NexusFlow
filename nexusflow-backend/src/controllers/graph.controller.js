import { saveGraph, updateGraph, getGraph, listGraphs, deleteGraph } from "../models/graphModel.js";
import { deployGraph, stopGraph, isRunning } from "../services/ruleRunner.js";
import { recordActivity } from "../models/activityLogModel.js";
import { DEVICES } from "../data/deviceRegistry.js";

const VALID_NODE_TYPES = new Set(["dataSource", "mathOp", "action"]);

/**
 * The canvas UI (Canvas.jsx / NodePalette.jsx) currently tags dropped nodes
 * as "sensor" / "filter" / "action". Mohan's streamCompiler.js expects the
 * canonical "dataSource" / "mathOp" / "action". Rather than ask the frontend
 * team to rename their node types mid-sprint, we normalize here — this is
 * the one seam between "what the canvas produces" and "what the compiler
 * expects", so it belongs in the graph controller, not spread across files.
 */
const NODE_TYPE_ALIASES = {
  sensor: "dataSource",
  filter: "mathOp",
  action: "action",
};

/**
 * There's no node config panel (Inspector.jsx) in the frontend yet, so
 * dataSource nodes dropped onto the canvas never get a deviceId — every
 * deploy would fail with "no deviceId configured". Until that panel exists,
 * fall back to matching the node's label against the device registry
 * (e.g. "Turbine Sensor" -> TUR-014), or the first registered device.
 */
function fillMissingDeviceId(node) {
  if (node.type !== "dataSource" || node.data?.deviceId) return node;

  const label = (node.data?.label || "").toLowerCase();
  const match =
    DEVICES.find((d) => label && d.label.toLowerCase().includes(label.split(" ")[0])) ||
    DEVICES[0];

  return { ...node, data: { ...node.data, deviceId: match.id } };
}

/** Same story for mathOp nodes — no Inspector panel yet to set operation/window. */
function fillMissingMathOpConfig(node) {
  if (node.type !== "mathOp" || node.data?.operation) return node;

  const label = (node.data?.label || "").toLowerCase();
  let operation = "Moving Average";
  let window = 10;
  if (label.includes("threshold")) {
    operation = "Threshold >";
    window = 80;
  } else if (label.includes("derivative")) {
    operation = "Derivative";
  }

  return { ...node, data: { ...node.data, operation, window } };
}

/** Same story for action nodes — no way yet to set actionType/target from the UI. */
function fillMissingActionConfig(node) {
  if (node.type !== "action" || node.data?.actionType) return node;

  const label = (node.data?.label || "").toLowerCase();
  if (label.includes("webhook")) {
    return { ...node, data: { ...node.data, actionType: "Webhook", target: "https://example.com/nexusflow-webhook" } };
  }
  // Default to SMS in mock mode — safe with no external account needed.
  return { ...node, data: { ...node.data, actionType: "SMS", target: "+15550000000" } };
}

function normalizeNodes(nodes) {
  return nodes
    .map((n) => ({ ...n, type: NODE_TYPE_ALIASES[n.type] || n.type }))
    .map(fillMissingDeviceId)
    .map(fillMissingMathOpConfig)
    .map(fillMissingActionConfig);
}

/**
 * Structural validation of a saved React Flow graph — independent of
 * Mohan's streamCompiler.js (which only runs at deploy time). Runs at save
 * time so bad graphs are rejected before they're ever persisted:
 *   - every node has a known (post-normalization) type
 *   - every edge references node ids that actually exist (no dangling edges)
 *   - the graph has no cycles (rule graphs must be a DAG)
 * Returns a list of human-readable problem strings (empty = valid).
 */
function validateGraphShape({ nodes, edges }) {
  const problems = [];

  // Day-4 addition: an empty pipeline is never deployable — catch it here
  // instead of letting it fail later inside the Stream Compiler with a
  // confusing error.
  if (nodes.length === 0) {
    problems.push("Graph has no nodes — add at least a Data Source and an Action node.");
    return problems;
  }

  const nodeIds = new Set(nodes.map((n) => n.id));

  // Day-4 addition: duplicate node ids silently corrupt the adjacency map
  // built below (later nodes overwrite earlier ones), which used to let
  // broken graphs slip past validation. Catch it explicitly instead.
  const seenIds = new Set();
  for (const node of nodes) {
    if (node.id && seenIds.has(node.id)) {
      problems.push(`Duplicate node id "${node.id}" — each node must have a unique id.`);
    }
    seenIds.add(node.id);
  }

  for (const node of nodes) {
    if (!node.id) problems.push("A node is missing an id.");
    if (!VALID_NODE_TYPES.has(node.type)) {
      problems.push(`Node "${node.id || "?"}" has an invalid type "${node.type}".`);
    }
  }

  const adjacency = new Map(nodes.map((n) => [n.id, []]));
  const connected = new Set();
  for (const edge of edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      problems.push(
        `Edge "${edge.id || `${edge.source}->${edge.target}`}" references a missing node — a connection points to a node that doesn't exist.`
      );
      continue;
    }
    adjacency.get(edge.source).push(edge.target);
    connected.add(edge.source);
    connected.add(edge.target);
  }

  // Day-4 addition: flag nodes that aren't wired into the pipeline at all.
  // A dataSource/mathOp/action dropped on the canvas but never connected
  // would otherwise save "successfully" and just silently do nothing at
  // deploy time. Only fires when there's more than one node, since a
  // single-node graph has nothing to connect to yet.
  if (nodes.length > 1) {
    for (const node of nodes) {
      if (node.id && !connected.has(node.id)) {
        problems.push(`Node "${node.id}" isn't connected to anything — link it to the pipeline or remove it.`);
      }
    }
  }

  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map(nodes.map((n) => [n.id, WHITE]));
  function hasCycle(id) {
    color.set(id, GRAY);
    for (const next of adjacency.get(id) || []) {
      if (color.get(next) === GRAY) return true;
      if (color.get(next) === WHITE && hasCycle(next)) return true;
    }
    color.set(id, BLACK);
    return false;
  }
  for (const node of nodes) {
    if (color.get(node.id) === WHITE && hasCycle(node.id)) {
      problems.push("Graph contains a cycle — rule pipelines must be acyclic.");
      break;
    }
  }

  return problems;
}

/**
 * Fetches a graph and confirms the requesting user owns it, sending the
 * right error response itself (404 if it doesn't exist, 403 if it belongs
 * to someone else) and returning null so callers can just `if (!graph) return;`.
 * Graphs saved before ownership existed (owner is undefined) stay
 * accessible to everyone rather than becoming orphaned.
 */
async function loadOwnedGraph(req, res) {
  const graph = await getGraph(req.params.id);
  if (!graph) {
    res.status(404).json({ error: "Graph not found." });
    return null;
  }
  if (graph.owner && graph.owner !== req.userId) {
    res.status(403).json({ error: "You don't have access to this graph." });
    return null;
  }
  return graph;
}

export async function create(req, res, next) {
  try {
    const { name, nodes, edges, status } = req.body;
    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
      return res.status(400).json({ error: "Body must include nodes[] and edges[]." });
    }

    const normalizedNodes = normalizeNodes(nodes);
    const problems = validateGraphShape({ nodes: normalizedNodes, edges });
    if (problems.length > 0) {
      return res.status(400).json({ error: "Graph failed validation.", details: problems });
    }

    const graph = await saveGraph({ name: name || "Untitled Graph", nodes: normalizedNodes, edges, status, owner: req.userId });
    res.status(201).json(graph);
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    res.json(await listGraphs({ owner: req.userId }));
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const graph = await loadOwnedGraph(req, res);
    if (!graph) return;
    res.json(graph);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const existing = await loadOwnedGraph(req, res);
    if (!existing) return;

    const { nodes, edges } = req.body;
    const body = { ...req.body };

    if (nodes !== undefined && edges !== undefined) {
      body.nodes = normalizeNodes(nodes);
      const problems = validateGraphShape({ nodes: body.nodes, edges });
      if (problems.length > 0) {
        return res.status(400).json({ error: "Graph failed validation.", details: problems });
      }
    }

    let graph = await updateGraph(req.params.id, body);

    // Day-4/5 fix: this used to call deployGraph() unguarded. deployGraph()
    // stops the OLD (working) subscriptions before compiling the new ones —
    // so if the new nodes/edges compile-fail (e.g. a Math Op referencing an
    // input that got disconnected), the pipeline went silently dark while
    // the DB record still said status: "running". Editing a live pipeline
    // could kill it with no visible error anywhere.
    if (isRunning(req.params.id)) {
      try {
        deployGraph(req.params.id, graph);
      } catch (err) {
        // Redeploy failed — the pipeline really is stopped now (deployGraph
        // already tore down the old subscriptions), so make the DB agree
        // with reality instead of lying about "running".
        graph = await updateGraph(req.params.id, { status: "stopped" });
        const reason = err.message?.startsWith("Stream Compiler") ? err.message : "Pipeline stopped: " + err.message;
        recordActivity({
          type: "error",
          message: `Live edit broke "${graph.name || req.params.id}" — pipeline stopped: ${reason}`,
          graphId: req.params.id,
        }).catch((e) => console.error("[graph.controller] failed to write activity log:", e.message));
        return res.status(200).json({ ...graph, deployWarning: reason });
      }
    }

    res.json(graph);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const graph = await loadOwnedGraph(req, res);
    if (!graph) return;

    stopGraph(req.params.id);
    await deleteGraph(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function deploy(req, res, next) {
  try {
    const graph = await loadOwnedGraph(req, res);
    if (!graph) return;

    const result = deployGraph(req.params.id, graph);
    await updateGraph(req.params.id, { status: "running" });
    res.json({ ok: true, ...result });
  } catch (err) {
    // compileGraph() throws plain Errors for structurally-bad graphs —
    // surface those as a clean 400 instead of a 500 crash.
    if (err.message?.startsWith("Stream Compiler")) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

export async function stop(req, res, next) {
  try {
    const graph = await loadOwnedGraph(req, res);
    if (!graph) return;

    const stopped = stopGraph(req.params.id);
    await updateGraph(req.params.id, { status: "stopped" });
    res.json({ ok: true, stopped });
  } catch (err) {
    next(err);
  }
}
