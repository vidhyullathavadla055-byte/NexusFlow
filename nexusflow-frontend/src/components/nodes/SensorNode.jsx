import { Handle, Position } from "reactflow";
import "./Node.css";

function SensorNode({ data }) {
  return (
    <div className="flow-node flow-node--blue">
      <div className="flow-node-bar" />
      <div className="flow-node-body">
        <strong>{data.label}</strong>
        <small>{data.sub}</small>
      </div>
      <Handle type="target" position={Position.Left} style={{ background: "#2563eb" }} />
      <Handle type="source" position={Position.Right} style={{ background: "#2563eb" }} />
    </div>
  );
}

export default SensorNode;
