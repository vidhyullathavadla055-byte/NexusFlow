import "./Inspector.css";

/**
 * Node property/config panel.
 *
 * This used to just show the selected node's label/sub as plain text.
 * The backend (graph.controller.js) has a `normalizeNodes` fallback that
 * guesses deviceId / operation / actionType from the node's label because
 * there was no real config panel yet — this component is that panel.
 * Editing here writes straight into node.data, so the values that get
 * saved/deployed are the ones the user actually picked, not a guess.
 */
function Inspector({ node, devices, onChange, onClose }) {
  if (!node) return null;

  const data = node.data || {};

  function set(patch) {
    onChange(node.id, patch);
  }

  return (
    <div className="canvas-inspector">
      <div className="canvas-inspector-head">
        <span className="canvas-inspector-label">{typeLabel(node.type)}</span>
        <button type="button" onClick={onClose} aria-label="Close inspector">
          ✕
        </button>
      </div>

      <label className="inspector-field">
        <span>Label</span>
        <input
          type="text"
          value={data.label || ""}
          onChange={(e) => set({ label: e.target.value })}
        />
      </label>

      {node.type === "dataSource" && (
        <DataSourceFields data={data} devices={devices} set={set} />
      )}
      {node.type === "mathOp" && <MathOpFields data={data} set={set} />}
      {node.type === "action" && <ActionFields data={data} set={set} />}
    </div>
  );
}

function DataSourceFields({ data, devices, set }) {
  return (
    <label className="inspector-field">
      <span>Device</span>
      <select
        value={data.deviceId || ""}
        onChange={(e) => {
          const device = devices.find((d) => d.id === e.target.value);
          set({
            deviceId: e.target.value,
            label: device ? device.label : data.label,
            sub: device ? `Data Source · ${device.metric}` : data.sub,
          });
        }}
      >
        <option value="" disabled>
          Select a device…
        </option>
        {devices.map((d) => (
          <option key={d.id} value={d.id}>
            {d.label} ({d.metric})
          </option>
        ))}
      </select>
    </label>
  );
}

function MathOpFields({ data, set }) {
  const operation = data.operation || "Moving Average";
  return (
    <>
      <label className="inspector-field">
        <span>Operation</span>
        <select
          value={operation}
          onChange={(e) => set({ operation: e.target.value, sub: subFor(e.target.value, data.window) })}
        >
          <option>Moving Average</option>
          <option>Threshold &gt;</option>
          <option>Threshold &lt;</option>
          <option>Derivative</option>
        </select>
      </label>

      {operation !== "Derivative" && (
        <label className="inspector-field">
          <span>{operation === "Moving Average" ? "Window size" : "Threshold value"}</span>
          <input
            type="number"
            value={data.window ?? (operation === "Moving Average" ? 10 : 80)}
            onChange={(e) => {
              const window = Number(e.target.value);
              set({ window, sub: subFor(operation, window) });
            }}
          />
        </label>
      )}
    </>
  );
}

function subFor(operation, window) {
  if (operation === "Derivative") return "Filter · rate of change";
  if (operation === "Moving Average") return `Filter · window = ${window ?? 10}`;
  return `Filter · ${operation} ${window ?? 80}`;
}

function ActionFields({ data, set }) {
  const actionType = data.actionType || "SMS";
  const placeholder =
    actionType === "SMS" ? "+15550000000" : actionType === "Webhook" ? "https://example.com/hook" : "ops@example.com";

  return (
    <>
      <label className="inspector-field">
        <span>Action type</span>
        <select
          value={actionType}
          onChange={(e) => set({ actionType: e.target.value, sub: `Action · ${e.target.value}` })}
        >
          <option>SMS</option>
          <option>Webhook</option>
          <option>Email</option>
        </select>
      </label>

      <label className="inspector-field">
        <span>{actionType === "SMS" ? "Phone number" : actionType === "Webhook" ? "Webhook URL" : "Email address"}</span>
        <input
          type="text"
          placeholder={placeholder}
          value={data.target || ""}
          onChange={(e) => set({ target: e.target.value })}
        />
      </label>
    </>
  );
}

function typeLabel(type) {
  if (type === "dataSource") return "Data Source";
  if (type === "mathOp") return "Math Operation";
  if (type === "action") return "Action Trigger";
  return "Selected Node";
}

export default Inspector;
