/**
 * Generic retry-with-backoff wrapper. Used to give the webhook/SMS
 * delivery services resilience against transient failures (network
 * blips, a receiving endpoint being briefly down) without changing
 * how those services themselves work.
 *
 * @param {(attempt:number) => Promise<T>} fn - must reject/throw on failure
 * @param {{retries?:number, baseDelayMs?:number, onAttempt?:(info)=>void}} opts
 */
export async function withRetry(fn, opts = {}) {
  const { retries = 3, baseDelayMs = 200, onAttempt } = opts;
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await fn(attempt);
      onAttempt?.({ attempt, ok: true });
      return result;
    } catch (err) {
      lastError = err;
      onAttempt?.({ attempt, ok: false, error: err });
      if (attempt < retries) {
        const delay = baseDelayMs * 2 ** (attempt - 1); // 200ms, 400ms, 800ms...
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}
