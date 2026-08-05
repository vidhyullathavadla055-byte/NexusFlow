import ReactFlow, {
  Background,
  Controls,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";

const nodes = [
  {
    id: "1",
    position: { x: 100, y: 100 },
    data: { label: "Start Node" },
  },
  {
    id: "2",
    position: { x: 400, y: 100 },
    data: { label: "Second Node" },
  },
];

const edges = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
  },
];

export default function Canvas() {
  return (
    <div style={{ width: "100%", height: "600px" }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}