import { getBezierPath, BaseEdge } from "reactflow";

/**
 * Animated 'glowing wire' — a soft base stroke plus a brighter dashed
 * overlay whose dash pattern travels along the path, reading as data
 * flowing from source to target rather than a static line.
 */
function GlowEdge({ id, sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, markerEnd, style }) {
  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={{ ...style, stroke: "var(--cyan-100)", strokeWidth: 3 }} />
      <path d={edgePath} className="glow-edge-flow" fill="none" markerEnd={markerEnd} />
    </>
  );
}

export default GlowEdge;
