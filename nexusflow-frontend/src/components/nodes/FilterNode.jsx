import { Handle, Position } from "reactflow";
import "./Node.css";

function FilterNode({ data }) {
  return (
    <div className="flow-node flow-node--green">
      <div className="flow-node-bar" />
      <div className="flow-node-body">
        <strong>{data.label}</strong>
        <small>{data.sub}</small>
      </div>
      <Handle type="target" position={Position.Left} style={{ background: "#10b981" }} />
      <Handle type="source" position={Position.Right} style={{ background: "#10b981" }} />
    </div>
  );
}

export default FilterNode;
