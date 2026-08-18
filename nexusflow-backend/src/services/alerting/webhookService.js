import axios from "axios";
import { env } from "../../config/env.js";

export async function callWebhook({ url, payload }) {
  try {
    const res = await axios.post(url, payload, { timeout: env.webhookTimeoutMs });
    return { ok: true, status: res.status };
  } catch (err) {
    console.error(`[webhook] delivery failed for ${url}:`, err.message);
    return { ok: false, error: err.message };
  }
}
