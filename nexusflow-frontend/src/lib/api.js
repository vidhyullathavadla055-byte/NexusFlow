const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

/**
 * Thin fetch wrapper
 */
async function request(path, { method = "GET", body, token } = {}) {
  let res;

  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Can't reach the server. Is the backend running?");
  }

  const isJson = res.headers
    .get("content-type")
    ?.includes("application/json");

  const data = isJson ? await res.json().catch(() => ({})) : null;

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }

  return data;
}

export const api = {
  signup: (name, email, password) =>
    request("/auth/signup", {
      method: "POST",
      body: { name, email, password },
    }),

  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: { email, password },
    }),

  me: (token) =>
    request("/auth/me", {
      token,
    }),

  // Graph APIs
  createGraph: (name, nodes, edges, token) =>
    request("/graphs", {
      method: "POST",
      body: {
        name,
        nodes,
        edges,
        status: "draft",
      },
      token,
    }),

  deployGraph: (graphId, token) =>
    request(`/graphs/${graphId}/deploy`, {
      method: "POST",
      token,
    }),

  updateGraph: (graphId, body, token) =>
    request(`/graphs/${graphId}`, {
      method: "PUT",
      body,
      token,
    }),

  listGraphs: (token) => request("/graphs", { token }),

  // Devices — powers the Inspector's device dropdown and the "Devices
  // Online" KPI. No auth required (matches device.routes.js).
  getDevices: () => request("/devices"),

  // Alerts — powers the "Alerts Today" KPI on the Dashboard.
  listAlerts: (token) => request("/alerts", { token }),

  // Telemetry stats — powers the "Ingest Rate" KPI on the Dashboard.
  getTelemetryStats: (token) => request("/telemetry/stats", { token }),
};