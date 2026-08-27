import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
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
import WebhookNode from "./nodes/WebhookNode";

const nodeTypes = {
  sensor: SensorNode,
  filter: FilterNode,
  action: ActionNode,
  webhook: WebhookNode,
};

const initialNodes = [
  {
    id: "1",
    type: "sensor",
    position: { x: 40, y: 140 },
    data: {
      label: "Turbine Sensor",
      sub: "Data Source · WebSocket",
    },
  },
  {
    id: "2",
    type: "filter",
    position: { x: 360, y: 140 },
    data: {
      label: "Moving Average",
      sub: "Filter · window = 10",
    },
  },
  {
    id: "3",
    type: "action",
    position: { x: 680, y: 140 },
    data: {
      label: "SMS Alert",
      sub: "Action · threshold > 80°C",
    },
  },
];

const initialEdges = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    animated: true,
    className: "glow-edge",
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    animated: true,
    className: "glow-edge",
  },
];

function CanvasInner() {
  const { token } = useAuth();

  const wrapperRef = useRef(null);

  const [nodes, setNodes, onNodesChange] =
    useNodesState(initialNodes);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState(initialEdges);

  const [reactFlowInstance, setReactFlowInstance] =
    useState(null);

  const [selected, setSelected] = useState(null);
  const [telemetry, setTelemetry] = useState(null);
const [telemetryLoading, setTelemetryLoading] = useState(false);

    const updateSelectedNode = (field, value) => {
    if (!selected) {
      return;
    }

    setNodes((nds) =>
      nds.map((node) =>
        node.id === selected.id
          ? {
              ...node,
              data: {
                ...node.data,
                [field]: value,
              },
            }
          : node
      )
    );

    setSelected((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value,
      },
    }));
  };
  useEffect(() => {
  if (!selected || selected.type !== "sensor") {
    setTelemetry(null);
    return;
  }

  const fetchTelemetry = async () => {
    try {
      setTelemetryLoading(true);

      const response = await fetch(
        "http://localhost:4000/api/telemetry/stats"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch telemetry");
      }

      const data = await response.json();

      console.log("Sensor telemetry:", data);

      setTelemetry(data);
    } catch (error) {
      console.error(
        "Failed to load sensor telemetry:",
        error
      );

      setTelemetry(null);
    } finally {
      setTelemetryLoading(false);
    }
  };

  fetchTelemetry();
}, [selected]);

  // Restore saved graph when Canvas opens
  useEffect(() => {
    const savedGraph =
      localStorage.getItem("nexusflow_graph");

    if (!savedGraph) {
      return;
    }

    try {
      const graph = JSON.parse(savedGraph);

      setNodes(graph.nodes || []);
      setEdges(graph.edges || []);

      console.log("Graph restored:", graph);
    } catch (error) {
      console.error(
        "Failed to restore graph:",
        error
      );
    }
  }, [setNodes, setEdges]);

  // Connect nodes
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            className: "glow-edge",
          },
          eds
        )
      ),
    [setEdges]
  );

  // Allow dropping nodes
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Drop node onto Canvas
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData(
        "application/nexusflow-node-type"
      );

      const label = event.dataTransfer.getData(
        "application/nexusflow-node-label"
      );

      const hint = event.dataTransfer.getData(
        "application/nexusflow-node-hint"
      );

      if (
        !type ||
        !reactFlowInstance ||
        !wrapperRef.current
      ) {
        return;
      }

      const bounds =
        wrapperRef.current.getBoundingClientRect();

      const position =
        reactFlowInstance.project({
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        });

      const newNode = {
        id: `${Date.now()}`,
        type,
        position,
        data: {
          label: label || "New Node",
          sub: hint || "",
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  // Save graph to localStorage
  const saveGraphToLocalStorage = () => {
    const graph = {
      nodes,
      edges,
    };

    localStorage.setItem(
      "nexusflow_graph",
      JSON.stringify(graph)
    );

    console.log("Graph saved:", graph);

    alert("Pipeline saved successfully!");
  };

  // Deploy graph
  const handleDeploy = async () => {
    try {
      const graph = await api.createGraph(
        "Turbine Monitoring Pipeline",
        nodes,
        edges,
        token
      );

      const graphId = graph._id;

      await api.deployGraph(graphId, token);

      alert("Graph deployed successfully!");
    } catch (err) {
      alert(`Deploy failed: ${err.message}`);
    }
  };

  return (
    <div className="canvas-shell">
      <NodePalette />

      <div
        className="canvas-area"
        ref={wrapperRef}
      >
        <div className="canvas-toolbar">
          <span className="canvas-toolbar-title">
            Pipeline Canvas
          </span>

          <div className="canvas-toolbar-actions">
            <button
              type="button"
              className="canvas-save-btn"
              onClick={() => {
                console.log("SAVE BUTTON CLICKED");
                saveGraphToLocalStorage();
              }}
            >
              Save Pipeline
            </button>

            <button
              type="button"
              className="canvas-save-btn"
              onClick={handleDeploy}
            >
              Deploy Pipeline
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
          onNodeClick={(_, node) =>
            setSelected(node)
          }
          onPaneClick={() =>
            setSelected(null)
          }
          nodeTypes={nodeTypes}
          fitView
          proOptions={{
            hideAttribution: true,
          }}
        >
          <MiniMap
            pannable
            zoomable
            className="canvas-minimap"
          />

          <Controls />

          <Background
            gap={22}
            size={1}
            color="#dbe2ea"
          />
        </ReactFlow>

        <div className="canvas-hint">
          <span className="canvas-hint-dot" />
          Live data flowing — wires glow while
          telemetry passes through
        </div>

        {selected && (
          <div className="canvas-inspector">
            <div className="canvas-inspector-head">
              <span className="canvas-inspector-label">
                Selected Node
              </span>

              <button
                type="button"
                onClick={() => setSelected(null)}
              >
                ✕
              </button>
            </div>

            <label>Node Label</label>

<input
  type="text"
  value={selected.data.label || ""}
  onChange={(e) =>
    updateSelectedNode("label", e.target.value)
  }
/>

            <span className="canvas-inspector-type">
              Type: {selected.type}
            </span>

            <label>Node Description</label>

<input
  type="text"
  value={selected.data.sub || ""}
  onChange={(e) =>
    updateSelectedNode("sub", e.target.value)
  }
/>

            <div className="canvas-inspector-details">
              {selected.type === "sensor" && (
  <>
    <div>
      <strong>Source:</strong> WebSocket
    </div>

    <div>
      <strong>Data:</strong> Turbine Telemetry
    </div>

    <div style={{ marginTop: "10px" }}>
      <strong>Latest Telemetry</strong>
    </div>

    {telemetryLoading && (
      <div>Loading telemetry...</div>
    )}

    {!telemetryLoading && telemetry && (
      <>
        {telemetry.temperature !== undefined && (
          <div>
            <strong>Temperature:</strong>{" "}
            {telemetry.temperature} °C
          </div>
        )}

        {telemetry.pressure !== undefined && (
          <div>
            <strong>Pressure:</strong>{" "}
            {telemetry.pressure}
          </div>
        )}

        {telemetry.rpm !== undefined && (
          <div>
            <strong>RPM:</strong>{" "}
            {telemetry.rpm}
          </div>
        )}
      </>
    )}

    {!telemetryLoading && !telemetry && (
      <div>
        No telemetry data available
      </div>
    )}
  </>
)}

              {selected.type === "filter" && (
                <>
                  <div>
                    <strong>Filter:</strong> Moving Average
                  </div>

                  <div>
                    <strong>Window:</strong> 10
                  </div>
                </>
              )}

              {selected.type === "action" && (
                <>
                  <div>
                    <strong>Action:</strong> SMS Alert
                  </div>

                  <div>
                    <strong>Threshold:</strong> &gt; 80°C
                  </div>
                </>
              )}

              {selected.type === "webhook" && (
                <>
                  <div>
                    <strong>Action:</strong> Webhook
                  </div>
                </>
              )}
            </div>
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