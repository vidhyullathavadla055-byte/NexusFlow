import { Handle, Position } from "reactflow";
import "./Node.css";

function ActionNode({ data }) {
  return (
    <div className="flow-node flow-node--red">
      <div className="flow-node-bar" />
      <div className="flow-node-body">
        <div className="flow-node-title-row">
          <strong>{data.label}</strong>
          <span className={`flow-node-status flow-node-status--${data.status || "idle"}`} title={data.status || "idle"} />
        </div>
        <small>{data.sub}</small>
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default ActionNode;
