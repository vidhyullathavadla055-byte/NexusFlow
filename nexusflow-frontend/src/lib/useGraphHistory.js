import { useCallback, useRef, useState } from "react";

const MAX_HISTORY = 50;

/**
 * Graph serialization (canvas -> JSON, JSON -> canvas) plus undo/redo.
 *
 * Canvas.jsx already keeps nodes/edges in React state via React Flow's
 * useNodesState/useEdgesState — this hook sits alongside that and snapshots
 * {nodes, edges} into an undo stack every time the caller tells it a
 * "committed" change happened (a drop, a connect, an inspector edit — not
 * every intermediate drag frame, or the stack would be useless noise).
 */
export function useGraphHistory(initialNodes, initialEdges) {
  const past = useRef([]);
  const future = useRef([]);
  // Tracks the current snapshot so `undo` has something to push onto `future`.
  const current = useRef(toJSON(initialNodes, initialEdges));
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const sync = useCallback(() => {
    setCanUndo(past.current.length > 0);
    setCanRedo(future.current.length > 0);
  }, []);

  /** Call after a meaningful change, with the *new* nodes/edges. */
  const commit = useCallback(
    (nodes, edges) => {
      past.current.push(current.current);
      if (past.current.length > MAX_HISTORY) past.current.shift();
      current.current = toJSON(nodes, edges);
      future.current = [];
      sync();
    },
    [sync]
  );

  /** Returns the snapshot to restore onto the canvas, or null if nothing to undo. */
  const undo = useCallback(() => {
    if (past.current.length === 0) return null;
    future.current.push(current.current);
    const snapshot = past.current.pop();
    current.current = snapshot;
    sync();
    return fromJSON(snapshot);
  }, [sync]);

  /** Returns the snapshot to restore onto the canvas, or null if nothing to redo. */
  const redo = useCallback(() => {
    if (future.current.length === 0) return null;
    past.current.push(current.current);
    const snapshot = future.current.pop();
    current.current = snapshot;
    sync();
    return fromJSON(snapshot);
  }, [sync]);

  const reset = useCallback(
    (nodes, edges) => {
      past.current = [];
      future.current = [];
      current.current = toJSON(nodes, edges);
      sync();
    },
    [sync]
  );

  return { commit, undo, redo, reset, canUndo, canRedo };
}

/** Canvas state -> plain JSON, safe to persist or hand to the backend as-is. */
export function toJSON(nodes, edges) {
  return {
    nodes: nodes.map((n) => ({ id: n.id, type: n.type, position: n.position, data: n.data })),
    edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target })),
  };
}

/** Saved/backend JSON -> React Flow node/edge shape (adds back render-only fields). */
export function fromJSON(graph) {
  return {
    nodes: (graph.nodes || []).map((n) => ({ ...n })),
    edges: (graph.edges || []).map((e) => ({ ...e, animated: true, className: "glow-edge" })),
  };
}
