import twilio from "twilio";
import { env } from "../../config/env.js";

let client = null;
function getClient() {
  if (!client) {
    if (!env.twilioSid || !env.twilioAuthToken) {
      throw new Error("Twilio is not configured — set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env.");
    }
    client = twilio(env.twilioSid, env.twilioAuthToken);
  }
  return client;
}

/**
 * Sends a real SMS via Twilio when SMS_PROVIDER_MODE=twilio and credentials
 * are set, otherwise logs to the console (SMS_PROVIDER_MODE=mock, the
 * default) — so the rule engine works out of the box with no signup
 * required, and upgrades to real texts with just three .env values.
 */
export async function sendSms({ to, body }) {
  if (env.smsProviderMode === "twilio") {
    if (!to) throw new Error("SMS action has no target phone number configured on the node.");
    if (!env.twilioFromNumber) throw new Error("TWILIO_FROM_NUMBER is not set in .env.");

    const message = await getClient().messages.create({
      to,
      from: env.twilioFromNumber,
      body,
    });
    console.log(`[sms:twilio] → ${to} :: sid=${message.sid} status=${message.status}`);
    return { ok: true, provider: "twilio", meta: { sid: message.sid, status: message.status } };
  }

  // Default — no external account needed, safe for demos and local dev.
  console.log(`[sms:mock] → ${to} :: ${body}`);
  return { ok: true, provider: "mock", meta: { to, body, sentAt: new Date().toISOString() } };
}
