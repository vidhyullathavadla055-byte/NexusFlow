// In a real deployment this would live in a `devices` collection with
// provisioning/auth metadata. Kept static here to match the frontend demo
// 1:1 (see nexusflow-frontend/src/data/mockTelemetry.js).

export const DEVICES = [
  { id: "TUR-014", label: "Turbine 14 — Bay A", metric: "Temperature", unit: "°C", base: 62, noise: 4, warn: 78, critical: 88 },
  { id: "TUR-022", label: "Turbine 22 — Bay B", metric: "Vibration", unit: "mm/s", base: 3.1, noise: 0.6, warn: 6.5, critical: 9 },
  { id: "CMP-003", label: "Compressor 3 — Bay C", metric: "Pressure", unit: "psi", base: 118, noise: 6, warn: 150, critical: 170 },
  { id: "MTR-091", label: "Motor 91 — Bay A", metric: "RPM", unit: "rpm", base: 1450, noise: 40, warn: 1800, critical: 2000 },
];

export function getDevice(deviceId) {
  return DEVICES.find((d) => d.id === deviceId);
}