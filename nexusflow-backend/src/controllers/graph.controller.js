import { saveGraph, updateGraph, getGraph, listGraphs, deleteGraph } from "../models/graphModel.js";
import { deployGraph, stopGraph, isRunning } from "../services/ruleRunner.js";

export async function create(req, res, next) {
  try {
    const { name, nodes, edges, status } = req.body;
    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
      return res.status(400).json({ error: "Body must include nodes[] and edges[]." });
    }
    const graph = await saveGraph({ name: name || "Untitled Graph", nodes, edges, status });
    res.status(201).json(graph);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const graph = await updateGraph(req.params.id, req.body);
    if (isRunning(req.params.id)) deployGraph(req.params.id, graph); // hot-reload a live pipeline
    res.json(graph);
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const graph = await getGraph(req.params.id);
    if (!graph) return res.status(404).json({ error: "Graph not found." });
    res.json({ ...graph, running: isRunning(req.params.id) });
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const graphs = await listGraphs();
    res.json(graphs.map((g) => ({ ...g, running: isRunning(String(g._id)) })));
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    stopGraph(req.params.id);
    await deleteGraph(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

/**
 * Compiles the saved graph into a live RxJS pipeline and subscribes it to
 * the telemetry bus. This is the "Compile & Run" action from the canvas
 * toolbar.
 */
export async function deploy(req, res, next) {
  try {
    const graph = await getGraph(req.params.id);
    if (!graph) return res.status(404).json({ error: "Graph not found." });
    const result = deployGraph(req.params.id, graph);
    await updateGraph(req.params.id, { status: "active" });
    res.json({ ok: true, ...result });
  } catch (err) {
    // Compiler errors (bad graph shape, cycles, missing config) are user errors, not 500s.
    res.status(422).json({ error: err.message });
  }
}

export async function stop(req, res, next) {
  try {
    const stopped = stopGraph(req.params.id);
    await updateGraph(req.params.id, { status: "draft" });
    res.json({ ok: true, stopped });
  } catch (err) {
    next(err);
  }
}
