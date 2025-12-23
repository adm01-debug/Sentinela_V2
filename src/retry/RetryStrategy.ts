export interface RetryConfig { maxAttempts: number; delayMs: number; backoff: 'linear' | 'exponential'; }
export const defaultRetryConfig: RetryConfig = { maxAttempts: 3, delayMs: 1000, backoff: 'exponential' };
export async function retry<T>(fn: () => Promise<T>, config: Partial<RetryConfig> = {}): Promise<T> {
  const cfg = { ...defaultRetryConfig, ...config };
  let lastError: Error;
  for (let attempt = 1; attempt <= cfg.maxAttempts; attempt++) {
    try { return await fn(); }
    catch (error) { lastError = error as Error; if (attempt < cfg.maxAttempts) { const delay = cfg.backoff === 'exponential' ? cfg.delayMs * Math.pow(2, attempt - 1) : cfg.delayMs * attempt; await new Promise(r => setTimeout(r, delay)); } }
  }
  throw lastError!;
}
