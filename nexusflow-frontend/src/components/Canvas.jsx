import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { useGraphHistory, toJSON } from "../lib/useGraphHistory";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import "./Canvas.css";

import NodePalette from "./NodePalette";
import Inspector from "./Inspector";
import DataSourceNode from "./nodes/SensorNode";
import MathOpNode from "./nodes/FilterNode";
import ActionNode from "./nodes/ActionNode";

// NOTE: node *type strings* must match what the backend's Stream Compiler
// expects ("dataSource" / "mathOp" / "action" — see streamCompiler.js and
// graph.controller.js's VALID_NODE_TYPES). The component files keep their
// original names (SensorNode.jsx, FilterNode.jsx) to avoid churn, but the
// React Flow `type` key below is what actually gets saved onto each node.
const nodeTypes = {
  dataSource: DataSourceNode,
  mathOp: MathOpNode,
  action: ActionNode,
};

const initialNodes = [
  {
    id: "1",
    type: "dataSource",
    position: { x: 40, y: 140 },
    data: { label: "Turbine 14 — Bay A", sub: "Data Source · Temperature", deviceId: "TUR-014" },
  },
  {
    id: "2",
    type: "mathOp",
    position: { x: 360, y: 140 },
    data: { label: "Moving Average", sub: "Filter · window = 10", operation: "Moving Average", window: 10 },
  },
  {
    id: "3",
    type: "action",
    position: { x: 680, y: 140 },
    data: { label: "SMS Alert", sub: "Action · SMS", actionType: "SMS", target: "+15550000000" },
  },
];

const initialEdges = [
  { id: "e1-2", source: "1", target: "2", animated: true, className: "glow-edge" },
  { id: "e2-3", source: "2", target: "3", animated: true, className: "glow-edge" },
];

let idCounter = 4;

function CanvasInner() {
  const { token } = useAuth();
  const wrapperRef = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [devices, setDevices] = useState([]);
  const [graphId, setGraphId] = useState(null); // set once we've saved — reused on redeploy so we don't duplicate graphs
  const [deployState, setDeployState] = useState("idle"); // idle | deploying | live | error

  const history = useGraphHistory(initialNodes, initialEdges);
  const selected = nodes.find((n) => n.id === selectedId) || null;

  useEffect(() => {
    api.getDevices().then(setDevices).catch(() => setDevices([]));
  }, []);

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => {
        const next = addEdge({ ...params, animated: true, className: "glow-edge" }, eds);
        history.commit(nodes, next);
        return next;
      });
    },
    [setEdges, nodes, history]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/nexusflow-node-type");
      const label = event.dataTransfer.getData("application/nexusflow-node-label");
      const hint = event.dataTransfer.getData("application/nexusflow-node-hint");
      if (!type || !reactFlowInstance || !wrapperRef.current) return;

      const bounds = wrapperRef.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const newNode = {
        id: `${idCounter++}`,
        type,
        position,
        data: defaultDataFor(type, label, hint),
      };
      setNodes((nds) => {
        const next = nds.concat(newNode);
        history.commit(next, edges);
        return next;
      });
    },
    [reactFlowInstance, setNodes, edges, history]
  );

  const onNodeDataChange = useCallback(
    (nodeId, patch) => {
      setNodes((nds) => {
        const next = nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...patch } } : n));
        history.commit(next, edges);
        return next;
      });
    },
    [setNodes, edges, history]
  );

  const applySnapshot = useCallback(
    (snapshot) => {
      if (!snapshot) return;
      setNodes(snapshot.nodes);
      setEdges(snapshot.edges);
    },
    [setNodes, setEdges]
  );

  const handleUndo = useCallback(() => applySnapshot(history.undo()), [applySnapshot, history]);
  const handleRedo = useCallback(() => applySnapshot(history.redo()), [applySnapshot, history]);

  useEffect(() => {
    function onKeyDown(e) {
      const meta = e.ctrlKey || e.metaKey;
      if (!meta) return;
      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
        e.preventDefault();
        handleRedo();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleUndo, handleRedo]);

  const handleDeploy = async () => {
    setDeployState("deploying");
    try {
      const { nodes: cleanNodes, edges: cleanEdges } = toJSON(nodes, edges);
      // Reuse the same saved graph on repeat deploys instead of creating a
      // new "Turbine Monitoring Pipeline" document every click.
      const graph = graphId
        ? await api.updateGraph(graphId, { name: "Turbine Monitoring Pipeline", nodes: cleanNodes, edges: cleanEdges }, token)
        : await api.createGraph("Turbine Monitoring Pipeline", cleanNodes, cleanEdges, token);

      if (!graphId) setGraphId(graph._id);

      await api.deployGraph(graph._id, token);
      setDeployState("live");
    } catch (err) {
      setDeployState("error");
      alert(`Deploy failed: ${err.message}`);
    }
  };

  return (
    <div className="canvas-shell">
      <NodePalette />

      <div className="canvas-area" ref={wrapperRef}>
        <div className="canvas-toolbar">
          <span className="canvas-toolbar-title">Pipeline Canvas</span>
          <div className="canvas-toolbar-actions">
            <button type="button" onClick={handleUndo} disabled={!history.canUndo} title="Undo (Ctrl+Z)">
              ↶ Undo
            </button>
            <button type="button" onClick={handleRedo} disabled={!history.canRedo} title="Redo (Ctrl+Y)">
              ↷ Redo
            </button>
            <button
              type="button"
              className="canvas-deploy-btn"
              onClick={handleDeploy}
              disabled={deployState === "deploying"}
            >
              {deployState === "deploying" ? "Deploying…" : graphId ? "Redeploy Graph" : "Deploy Graph"}
            </button>
          </div>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={(_, node) => setSelectedId(node.id)}
          onPaneClick={() => setSelectedId(null)}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <MiniMap pannable zoomable className="canvas-minimap" />
          <Controls />
          <Background gap={22} size={1} color="#dbe2ea" />
        </ReactFlow>

        <div className="canvas-hint">
          <span className="canvas-hint-dot" />
          {deployState === "live"
            ? "Live — deployed pipeline is running"
            : "Live data flowing — wires glow while telemetry passes through"}
        </div>

        <Inspector node={selected} devices={devices} onChange={onNodeDataChange} onClose={() => setSelectedId(null)} />
      </div>
    </div>
  );
}

function defaultDataFor(type, label, hint) {
  if (type === "dataSource") {
    return { label: label || "Data Source", sub: hint || "Data Source", deviceId: "" };
  }
  if (type === "mathOp") {
    return { label: label || "Math Operation", sub: hint || "Filter · window = 10", operation: "Moving Average", window: 10 };
  }
  return { label: label || "Action Trigger", sub: hint || "Action", actionType: "SMS", target: "" };
}

function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}

export default Canvas;
