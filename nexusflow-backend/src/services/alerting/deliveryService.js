import { callWebhook } from "./webhookService.js";
import { sendSms } from "./smsService.js";
import { withRetry } from "./retry.js";
import { recordDelivery } from "../../models/deliveryHistoryModel.js";

/**
 * Retries + records a webhook delivery. Does not change callWebhook's own
 * behavior — callWebhook already catches its own errors and returns
 * { ok:false, error }, so we translate that into a thrown error here to
 * drive the retry loop, then unwrap it back to a plain result.
 */
export async function deliverWebhook({ url, payload }, retryOpts = {}) {
  let attemptsMade = 0;

  try {
    const result = await withRetry(async (attempt) => {
      attemptsMade = attempt;
      const res = await callWebhook({ url, payload });
      if (!res.ok) throw new Error(res.error || "Webhook delivery failed");
      return res;
    }, retryOpts);

    await recordDelivery({ channel: "webhook", target: url, status: "delivered", attempts: attemptsMade });
    return { ...result, attempts: attemptsMade };
  } catch (err) {
    await recordDelivery({ channel: "webhook", target: url, status: "failed", attempts: attemptsMade, error: err.message });
    return { ok: false, error: err.message, attempts: attemptsMade };
  }
}

/**
 * Retries + records an SMS delivery. sendSms throws on config errors
 * (missing target/credentials) — those are NOT retried, since retrying a
 * misconfiguration just wastes attempts. Only transient failures
 * (network/provider errors) get retried.
 */
export async function deliverSms({ to, body }, retryOpts = {}) {
  let attemptsMade = 0;

  // Config errors fail fast — don't burn retry attempts on something that
  // will never succeed no matter how many times we try it.
  if (!to) {
    await recordDelivery({ channel: "sms", target: to || "(none)", status: "failed", attempts: 0, error: "no target phone number configured" });
    return { ok: false, error: "SMS action has no target phone number configured on the node.", attempts: 0 };
  }

  try {
    const result = await withRetry(async (attempt) => {
      attemptsMade = attempt;
      return await sendSms({ to, body });
    }, retryOpts);

    await recordDelivery({ channel: "sms", target: to, status: "delivered", attempts: attemptsMade, meta: result.meta });
    return { ...result, attempts: attemptsMade };
  } catch (err) {
    await recordDelivery({ channel: "sms", target: to, status: "failed", attempts: attemptsMade, error: err.message });
    return { ok: false, error: err.message, attempts: attemptsMade };
  }
}
