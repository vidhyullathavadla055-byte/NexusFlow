import { compileGraph } from "./streamCompiler.js";
import { deliverSms, deliverWebhook } from "./alerting/deliveryService.js";
import { recordAlert } from "../models/alertModel.js";
import { recordActivity } from "../models/activityLogModel.js";
import { broadcast } from "../websocket/wsServer.js";

/** graphId -> { subscriptions: Subscription[], deployedAt } */
const active = new Map();

export function deployGraph(graphId, graph) {
  stopGraph(graphId); // idempotent redeploy

  const compiled = compileGraph(graph); // throws on invalid graph — caller should catch
  const subscriptions = compiled.map(({ node, observable }) =>
    observable.subscribe({
      next: (value) => handleActionFire(graphId, graph, node, value),
      error: (err) => handlePipelineError(graphId, graph, err),
    })
  );

  active.set(graphId, { subscriptions, deployedAt: new Date(), nodeCount: graph.nodes.length });
  console.log(`[ruleRunner] deployed graph ${graphId} — ${compiled.length} action pipeline(s) live`);

  logActivity({
    type: "deploy",
    message: `Deployed "${graph.name || graphId}" — ${compiled.length} action pipeline(s) live`,
    graphId,
  });

  return { actionCount: compiled.length };
}

export function stopGraph(graphId) {
  const running = active.get(graphId);
  if (!running) return false;
  running.subscriptions.forEach((s) => s.unsubscribe());
  active.delete(graphId);
  console.log(`[ruleRunner] stopped graph ${graphId}`);
  return true;
}

export function isRunning(graphId) {
  return active.has(graphId);
}

export function listRunning() {
  return [...active.entries()].map(([graphId, info]) => ({
    graphId,
    deployedAt: info.deployedAt,
    nodeCount: info.nodeCount,
  }));
}

/**
 * activityLogModel.js already existed with recordActivity()/listActivity(),
 * but nothing ever called it — this is the wiring point. Failures here
 * (e.g. DB hiccup) must never take down a live rule pipeline, so this is
 * deliberately fire-and-forget with its own catch.
 */
function logActivity(entry) {
  recordActivity(entry).catch((err) =>
    console.error(`[ruleRunner] failed to write activity log:`, err.message)
  );
}

function handlePipelineError(graphId, graph, err) {
  console.error(`[ruleRunner] pipeline error on graph ${graphId}:`, err.message);
  logActivity({
    type: "error",
    message: `Pipeline error on "${graph.name || graphId}": ${err.message}`,
    graphId,
  });
}

async function handleActionFire(graphId, graph, actionNode, value) {
  const { actionType, target, label } = actionNode.data;
  const summary = `Rule "${graph.name || graphId}" fired — ${label} (${actionType})`;
  console.log(`[ruleRunner] ${summary} — value=${JSON.stringify(value)}`);

  // Action nodes don't carry a deviceId themselves (only Data Source nodes
  // do) — take the graph's first Data Source as a reasonable "which device
  // caused this" for the alert/activity feeds.
  const deviceId = graph.nodes.find((n) => n.type === "dataSource")?.data?.deviceId;

  // SMS/Webhook actions go through deliveryService.js, so a live
  // rule-fired action gets the same retry-with-backoff and delivery-history
  // logging as everywhere else (previously this called sendSms/callWebhook
  // directly and never retried a transient failure).
  let deliveryResult;
  if (actionType === "SMS") {
    deliveryResult = await deliverSms({ to: target, body: `NexusFlow alert: ${summary}. Value: ${JSON.stringify(value)}` });
  } else if (actionType === "Webhook") {
    deliveryResult = await deliverWebhook({ url: target, payload: { graphId, node: actionNode, value, firedAt: new Date().toISOString() } });
  } else if (actionType === "Email") {
    console.log(`[email:mock] → ${target} :: ${summary}`);
    deliveryResult = { ok: true, provider: "mock" };
  } else {
    deliveryResult = { ok: false, error: `Unsupported action type "${actionType}"` };
  }

  const alert = await recordAlert({
    graphId,
    nodeId: actionNode.id,
    deviceId,
    actionType,
    target,
    value,
    title: summary,
    delivered: !!deliveryResult.ok,
  });

  broadcast({ type: "alert", payload: alert });

  logActivity({
    type: "rule_trigger",
    message: summary,
    graphId,
    deviceId,
    meta: { actionType, target, delivered: !!deliveryResult.ok },
  });
}
