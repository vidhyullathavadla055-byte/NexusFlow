import { compileGraph } from "./streamCompiler.js";
import { deliverSms, deliverWebhook } from "./alerting/deliveryService.js";
import { recordAlert } from "../models/alertModel.js";
import { broadcast } from "../websocket/wsServer.js";

/** graphId -> { subscriptions: Subscription[], deployedAt } */
const active = new Map();

export function deployGraph(graphId, graph) {
  stopGraph(graphId); // idempotent redeploy

  const compiled = compileGraph(graph); // throws on invalid graph — caller should catch
  const subscriptions = compiled.map(({ node, observable }) =>
    observable.subscribe({
      // Day 11 — handleActionFire is async; the old code called it here
      // without handling its rejection, which becomes an unhandled
      // promise rejection (and can crash the process) if it ever throws.
      // Route failures through the same error log instead.
      next: (value) => {
        handleActionFire(graphId, graph, node, value).catch((err) => {
          console.error(`[ruleRunner] action handler failed for graph ${graphId}:`, err.message);
        });
      },
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

  // Day 11 — SMS/Webhook actions now go through deliveryService.js, so a
  // live rule-fired action gets the same retry-with-backoff and
  // delivery-history logging that Day 10 built (previously this called
  // sendSms/callWebhook directly and never retried a transient failure).
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
    actionType,
    target,
    value,
    title: summary,
    delivered: !!deliveryResult.ok,
  });

  broadcast({ type: "alert", payload: alert });
}
