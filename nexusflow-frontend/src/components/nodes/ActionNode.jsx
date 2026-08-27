import { Handle, Position } from "reactflow";
import "./Node.css";

function ActionNode({ data }) {
  return (
    <div className="flow-node flow-node--red">
      <div className="flow-node-bar" />
      <div className="flow-node-body">
        <strong>{data.label}</strong>=
        <small>{data.sub}</small>
      </div>
      <Handle type="target" position={Position.Left} style={{ background: "#ef4444" }} />
      <Handle type="source" position={Position.Right} style={{ background: "#ef4444" }} />
    </div>
  );
}

export default ActionNode;
