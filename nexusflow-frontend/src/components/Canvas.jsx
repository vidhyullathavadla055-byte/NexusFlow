import { useCallback, useRef, useState } from "react";
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
import SensorNode from "./nodes/SensorNode";
import FilterNode from "./nodes/FilterNode";
import ActionNode from "./nodes/ActionNode";

const nodeTypes = {
  sensor: SensorNode,
  filter: FilterNode,
  action: ActionNode,
};

const initialNodes = [
  {
    id: "1",
    type: "sensor",
    position: { x: 40, y: 140 },
    data: { label: "Turbine Sensor", sub: "Data Source · WebSocket" },
  },
  {
    id: "2",
    type: "filter",
    position: { x: 360, y: 140 },
    data: { label: "Moving Average", sub: "Filter · window = 10" },
  },
  {
    id: "3",
    type: "action",
    position: { x: 680, y: 140 },
    data: { label: "SMS Alert", sub: "Action · threshold > 80°C" },
  },
];

const initialEdges = [
  { id: "e1-2", source: "1", target: "2", animated: true, className: "glow-edge" },
  { id: "e2-3", source: "2", target: "3", animated: true, className: "glow-edge" },
];

let idCounter = 4;

function CanvasInner() {
  const wrapperRef = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selected, setSelected] = useState(null);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) => addEdge({ ...params, animated: true, className: "glow-edge" }, eds)),
    [setEdges]
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
        data: { label: label || "New Node", sub: hint || "" },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  return (
    <div className="canvas-shell">
      <NodePalette />

      <div className="canvas-area" ref={wrapperRef}>
        <div className="canvas-toolbar">
          <span className="canvas-toolbar-title">Pipeline Canvas</span>
          <button
            type="button"
            className="canvas-deploy-btn"
            onClick={() => alert("Graph deployed! (demo — will call the real Deploy API once the backend is wired up)")}
          >
            Deploy Graph
          </button>
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
          onNodeClick={(_, node) => setSelected(node)}
          onPaneClick={() => setSelected(null)}
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
          Live data flowing — wires glow while telemetry passes through
        </div>

        {selected && (
          <div className="canvas-inspector">
            <div className="canvas-inspector-head">
              <span className="canvas-inspector-label">Selected Node</span>
              <button type="button" onClick={() => setSelected(null)}>
                ✕
              </button>
            </div>
            <h4>{selected.data.label}</h4>
            <p>{selected.data.sub}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}

export default Canvas;
