import { compileGraph } from "./streamCompiler.js";
import { sendSms } from "./alerting/smsService.js";
import { callWebhook } from "./alerting/webhookService.js";
import { recordAlert } from "../models/alertModel.js";
import { broadcast } from "../websocket/wsServer.js";

/** graphId -> { subscriptions: Subscription[], deployedAt } */
const active = new Map();

export function deployGraph(graphId, graph) {
  stopGraph(graphId); // idempotent redeploy

  const compiled = compileGraph(graph); // throws on invalid graph — caller should catch
  const subscriptions = compiled.map(({ node, observable }) =>
    observable.subscribe({
      next: (value) => handleActionFire(graphId, graph, node, value),
      error: (err) => console.error(`[ruleRunner] pipeline error on graph ${graphId}:`, err.message),
    })
  );

  active.set(graphId, { subscriptions, deployedAt: new Date(), nodeCount: graph.nodes.length });
  console.log(`[ruleRunner] deployed graph ${graphId} — ${compiled.length} action pipeline(s) live`);
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

async function handleActionFire(graphId, graph, actionNode, value) {
  const { actionType, target, label } = actionNode.data;
  const summary = `Rule "${graph.name || graphId}" fired — ${label} (${actionType})`;
  console.log(`[ruleRunner] ${summary} — value=${JSON.stringify(value)}`);

  let deliveryResult;
  if (actionType === "SMS") {
    deliveryResult = await sendSms({ to: target, body: `NexusFlow alert: ${summary}. Value: ${JSON.stringify(value)}` });
  } else if (actionType === "Webhook") {
    deliveryResult = await callWebhook({ url: target, payload: { graphId, node: actionNode, value, firedAt: new Date().toISOString() } });
  } else if (actionType === "Email") {
    console.log(`[email:mock] → ${target} :: ${summary}`);
    deliveryResult = { ok: true, provider: "mock" };
  } else {
    deliveryResult = { ok: false, error: `Unsupported action type "${actionType}"` };
  }

  const alert = await recordAlert({
    graphId,
    nodeId: actionNode.id,
    actionType,
    target,
    value,
    title: summary,
    delivered: !!deliveryResult.ok,
  });

  broadcast({ type: "alert", payload: alert });
}
