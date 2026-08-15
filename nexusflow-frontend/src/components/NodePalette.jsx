import "./NodePalette.css";

const ITEMS = [
  { type: "sensor", label: "Turbine Sensor", hint: "Data Source", color: "blue" },
  { type: "sensor", label: "Data Source", hint: "Generic input", color: "blue" },
  { type: "filter", label: "Moving Average", hint: "Filter", color: "green" },
  { type: "filter", label: "Math Operation", hint: "Filter", color: "green" },
  { type: "action", label: "SMS Alert", hint: "Action Trigger", color: "red" },
  { type: "webhook", label: "Webhook Trigger", hint: "Action Trigger", color: "red" },
];

function NodePalette() {
  function onDragStart(event, item) {
    event.dataTransfer.setData("application/nexusflow-node-type", item.type);
    event.dataTransfer.setData("application/nexusflow-node-label", item.label);
    event.dataTransfer.setData("application/nexusflow-node-hint", item.hint);
    event.dataTransfer.effectAllowed = "move";
  }

  return (
    <aside className="node-palette">
      <h3>Node Library</h3>
      <div className="node-palette-list">
        {ITEMS.map((item) => (
          <div
            key={item.label}
            className={`node-palette-item node-palette-item--${item.color}`}
            draggable
            onDragStart={(e) => onDragStart(e, item)}
          >
            <span className="node-palette-dot" />
            <div>
              <strong>{item.label}</strong>
              <small>{item.hint}</small>
            </div>
          </div>
        ))}
      </div>
      <p className="node-palette-hint">Drag a node onto the canvas to build your pipeline</p>
    </aside>
  );
}

export default NodePalette;
