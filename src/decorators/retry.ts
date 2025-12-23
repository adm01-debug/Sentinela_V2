export function retry<T extends (...args: any[]) => Promise<any>>(fn: T, maxRetries = 3, delay = 1000): T {
  return (async (...args: Parameters<T>) => {
    let lastError: Error;
    for (let i = 0; i <= maxRetries; i++) {
      try { return await fn(...args); }
      catch (e) { lastError = e as Error; if (i < maxRetries) await new Promise(r => setTimeout(r, delay * (i + 1))); }
    }
    throw lastError!;
  }) as T;
}

export function retryWithBackoff<T extends (...args: any[]) => Promise<any>>(fn: T, maxRetries = 3, baseDelay = 1000): T {
  return (async (...args: Parameters<T>) => {
    let lastError: Error;
    for (let i = 0; i <= maxRetries; i++) {
      try { return await fn(...args); }
      catch (e) { lastError = e as Error; if (i < maxRetries) await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, i))); }
    }
    throw lastError!;
  }) as T;
}
