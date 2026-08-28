/**
 * Sample graphs used to test canvas rendering + serialization, and to give
 * new users a working starting point instead of a blank canvas. Node/edge
 * shape here must match what the backend expects (dataSource/mathOp/action
 * types, with the data fields graph.controller.js validates) — these are
 * good regression-test fixtures for exactly that reason.
 */

export const SAMPLE_GRAPHS = [
  {
    name: "Turbine Temperature Watch",
    description: "Moving average on Turbine 14's temperature, texts on drift.",
    nodes: [
      {
        id: "1",
        type: "dataSource",
        position: { x: 40, y: 140 },
        data: { label: "Turbine 14 — Bay A", sub: "Data Source · Temperature", deviceId: "TUR-014" },
      },
      {
        id: "2",
        type: "mathOp",
        position: { x: 360, y: 140 },
        data: { label: "Moving Average", sub: "Filter · window = 10", operation: "Moving Average", window: 10 },
      },
      {
        id: "3",
        type: "action",
        position: { x: 680, y: 140 },
        data: { label: "SMS Alert", sub: "Action · SMS", actionType: "SMS", target: "+15550000000" },
      },
    ],
    edges: [
      { id: "e1-2", source: "1", target: "2" },
      { id: "e2-3", source: "2", target: "3" },
    ],
  },
  {
    name: "Compressor Pressure Threshold",
    description: "Fires a webhook the moment Compressor 3's pressure crosses 150 psi.",
    nodes: [
      {
        id: "1",
        type: "dataSource",
        position: { x: 40, y: 140 },
        data: { label: "Compressor 3 — Bay C", sub: "Data Source · Pressure", deviceId: "CMP-003" },
      },
      {
        id: "2",
        type: "mathOp",
        position: { x: 360, y: 140 },
        data: { label: "Threshold >", sub: "Filter · Threshold > 150", operation: "Threshold >", window: 150 },
      },
      {
        id: "3",
        type: "action",
        position: { x: 680, y: 140 },
        data: { label: "Webhook Trigger", sub: "Action · Webhook", actionType: "Webhook", target: "https://example.com/hook" },
      },
    ],
    edges: [
      { id: "e1-2", source: "1", target: "2" },
      { id: "e2-3", source: "2", target: "3" },
    ],
  },
];

/** Canvas.jsx's default starting graph. */
export function getDefaultGraph() {
  return SAMPLE_GRAPHS[0];
}
