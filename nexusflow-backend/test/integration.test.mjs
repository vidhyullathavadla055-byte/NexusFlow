/**
 * Full backend integration test — exercises auth, graph validation,
 * node-type normalization, deploy/hot-reload/delete, ownership checks,
 * live rule firing, WebSocket broadcast, and error handling end to end.
 *
 * Run against a real running server (needs a real MongoDB connection):
 *   npm start                                  # terminal 1
 *   TEST_TARGET=http://localhost:4000 node test/integration.test.mjs
 *
 * Or just `node test/integration.test.mjs` if the server is on the
 * default port from .env.
 */
import axios from "axios";
import WebSocket from "ws";
import "dotenv/config";

const BASE = process.env.TEST_TARGET || `http://localhost:${process.env.PORT || 4000}`;
let pass = 0, fail = 0;
function check(label, cond) {
  if (cond) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; console.log(`  ✗ FAILED: ${label}`); }
}

async function req(method, path, data, token) {
  try {
    const res = await axios({ method, url: BASE + path, data, headers: token ? { Authorization: `Bearer ${token}` } : {}, validateStatus: () => true });
    return res;
  } catch (err) {
    return { status: 0, data: { error: err.message } };
  }
}

console.log("=== Auth ===");
const email = `day12_${Date.now()}@example.com`;
let token, userId;
{
  const signup = await req("post", "/api/auth/signup", { name: "Day12", email, password: "password123" });
  check("signup returns 201", signup.status === 201);
  check("signup returns token", !!signup.data.token);
  token = signup.data.token;

  const dup = await req("post", "/api/auth/signup", { name: "Dup", email, password: "password123" });
  check("duplicate signup rejected", dup.status >= 400);

  const login = await req("post", "/api/auth/login", { email, password: "password123" });
  check("login succeeds", login.status === 200 && !!login.data.token);

  const badLogin = await req("post", "/api/auth/login", { email, password: "wrongpassword" });
  check("wrong password rejected", badLogin.status === 401 || badLogin.status === 400);

  const me = await req("get", "/api/auth/me", null, token);
  check("me returns user", me.status === 200);
  userId = me.data?._id || me.data?.id;

  const meNoAuth = await req("get", "/api/auth/me", null, null);
  check("me without token rejected", meNoAuth.status === 401);
}

console.log("=== Devices / Ingest / Telemetry ===");
{
  const devices = await req("get", "/api/devices");
  check("devices list returns array", Array.isArray(devices.data) && devices.data.length > 0);

  const ingest = await req("post", "/api/ingest", { deviceId: "TUR-014", metric: "Temperature", unit: "C", value: 55 });
  check("ingest succeeds", ingest.status === 201);

  const badIngest = await req("post", "/api/ingest", { deviceId: "TUR-014" });
  check("ingest without value rejected", badIngest.status === 400);

  const bulk = await req("post", "/api/ingest/bulk", { readings: [{ deviceId: "CMP-003", value: 10 }, { deviceId: "PMP-007", value: 20 }] });
  check("bulk ingest succeeds", bulk.status === 201);

  const stats = await req("get", "/api/telemetry/stats", null, token);
  check("telemetry stats accessible with auth", stats.status === 200);

  const statsNoAuth = await req("get", "/api/telemetry/stats");
  check("telemetry stats rejects no auth", statsNoAuth.status === 401);

  const history = await req("get", "/api/telemetry/TUR-014/history", null, token);
  check("telemetry history returns data", history.status === 200);
}

console.log("=== Graph validation ===");
{
  const noNodes = await req("post", "/api/graphs", { name: "Empty", nodes: [], edges: [] }, token);
  check("empty graph rejected", noNodes.status === 400);

  const dupIds = await req("post", "/api/graphs", {
    name: "Dup",
    nodes: [{ id: "a", type: "dataSource", data: { deviceId: "TUR-014" } }, { id: "a", type: "action", data: {} }],
    edges: [{ id: "e1", source: "a", target: "a" }],
  }, token);
  check("duplicate node ids rejected", dupIds.status === 400);

  const cyclic = await req("post", "/api/graphs", {
    name: "Cycle",
    nodes: [{ id: "a", type: "mathOp", data: { operation: "Derivative" } }, { id: "b", type: "action", data: {} }],
    edges: [{ id: "e1", source: "a", target: "b" }, { id: "e2", source: "b", target: "a" }],
  }, token);
  check("cyclic graph rejected", cyclic.status === 400);

  const disconnected = await req("post", "/api/graphs", {
    name: "Loose",
    nodes: [
      { id: "a", type: "dataSource", data: { deviceId: "TUR-014" } },
      { id: "b", type: "action", data: {} },
      { id: "c", type: "mathOp", data: { operation: "Derivative" } }, // never connected
    ],
    edges: [{ id: "e1", source: "a", target: "b" }],
  }, token);
  check("disconnected node rejected", disconnected.status === 400);
}

console.log("=== Graph node-type aliasing & auto-fill (frontend gap workaround) ===");
let graphId;
{
  const res = await req("post", "/api/graphs", {
    name: "Aliased Graph",
    nodes: [
      { id: "a", type: "sensor", data: { label: "Turbine Sensor" } },  // alias, no deviceId
      { id: "b", type: "action", data: { label: "Webhook Alert" } },   // no actionType/target
    ],
    edges: [{ id: "e1", source: "a", target: "b" }],
  }, token);
  check("aliased graph accepted", res.status === 201);
  check("'sensor' normalized to 'dataSource'", res.data?.nodes?.[0]?.type === "dataSource");
  check("missing deviceId auto-filled", !!res.data?.nodes?.[0]?.data?.deviceId);
  check("'webhook' label inferred actionType", res.data?.nodes?.[1]?.data?.actionType === "Webhook");
  graphId = res.data?._id;
}

console.log("=== Graph CRUD + deploy/stop/hot-reload/delete ===");
{
  const get = await req("get", `/api/graphs/${graphId}`, null, token);
  check("get graph by id", get.status === 200);

  const deploy = await req("post", `/api/graphs/${graphId}/deploy`, null, token);
  check("deploy succeeds", deploy.status === 200 && deploy.data.ok === true);

  const update = await req("put", `/api/graphs/${graphId}`, {
    nodes: [
      { id: "a", type: "dataSource", data: { deviceId: "TUR-014" } },
      { id: "b", type: "action", data: { actionType: "SMS", target: "+15550001111" } },
    ],
    edges: [{ id: "e1", source: "a", target: "b" }],
  }, token);
  check("update while deployed hot-reloads without error", update.status === 200);

  const stop = await req("post", `/api/graphs/${graphId}/stop`, null, token);
  check("stop succeeds", stop.status === 200 && stop.data.stopped === true);

  const del = await req("delete", `/api/graphs/${graphId}`, null, token);
  check("delete succeeds", del.status === 204);

  const getAfterDelete = await req("get", `/api/graphs/${graphId}`, null, token);
  check("graph gone after delete", getAfterDelete.status === 404);
}

console.log("=== Ownership enforcement ===");
{
  const other = await req("post", "/api/auth/signup", { name: "Other", email: `other_${Date.now()}@example.com`, password: "password123" });
  const otherToken = other.data.token;

  const mine = await req("post", "/api/graphs", {
    name: "Mine",
    nodes: [{ id: "a", type: "dataSource", data: { deviceId: "TUR-014" } }, { id: "b", type: "action", data: { actionType: "SMS", target: "+1" } }],
    edges: [{ id: "e1", source: "a", target: "b" }],
  }, token);
  const mineId = mine.data._id;

  const stolen = await req("get", `/api/graphs/${mineId}`, null, otherToken);
  check("other user gets 403 on someone else's graph", stolen.status === 403);
}

console.log("=== Alerts + live rule firing (end-to-end) ===");
{
  const graph = await req("post", "/api/graphs", {
    name: "Live Fire Test",
    nodes: [
      { id: "a", type: "dataSource", data: { deviceId: "TUR-014" } },
      { id: "b", type: "action", data: { actionType: "Email", target: "test@example.com" } },
    ],
    edges: [{ id: "e1", source: "a", target: "b" }],
  }, token);
  const liveGraphId = graph.data._id;

  await req("post", `/api/graphs/${liveGraphId}/deploy`, null, token);
  await req("post", "/api/ingest", { deviceId: "TUR-014", value: 77 });
  await new Promise((r) => setTimeout(r, 300));

  const alerts = await req("get", "/api/alerts", null, token);
  check("alerts list accessible", alerts.status === 200);
  check("a live-fired alert was recorded", Array.isArray(alerts.data) && alerts.data.some((a) => a.graphId === liveGraphId));

  await req("post", `/api/graphs/${liveGraphId}/stop`, null, token);
}

console.log("=== WebSocket ===");
{
  const wsResult = await new Promise((resolve) => {
    const ws = new WebSocket(BASE.replace(/^http/, "ws") + "/ws");
    const received = [];
    ws.on("open", async () => {
      setTimeout(async () => {
        await req("post", "/api/ingest", { deviceId: "TUR-014", value: 42 });
      }, 200);
    });
    ws.on("message", (data) => received.push(JSON.parse(data.toString())));
    setTimeout(() => { ws.close(); resolve(received); }, 1000);
  });
  check("websocket receives hello on connect", wsResult.some((m) => m.type === "hello"));
  check("websocket receives telemetry broadcast on ingest", wsResult.some((m) => m.type === "telemetry"));
}

console.log("=== Errors ===");
{
  const notFound = await req("get", "/api/totally-not-a-route");
  check("unknown route returns 404 with message", notFound.status === 404 && !!notFound.data.error);

  const malformed = await axios.post(`${BASE}/api/ingest`, "{bad json", {
    headers: { "Content-Type": "application/json" }, validateStatus: () => true,
  });
  check("malformed JSON body doesn't crash server (returns 4xx)", malformed.status >= 400 && malformed.status < 500);

  const stillAlive = await req("get", "/health");
  check("server still alive after malformed request", stillAlive.status === 200);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
