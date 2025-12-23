export const batchProcessor = {
  process: async <T, R>(items: T[], fn: (item: T) => Promise<R>, batchSize = 10): Promise<R[]> => { const results: R[] = []; for (let i = 0; i < items.length; i += batchSize) { const batch = items.slice(i, i + batchSize); const batchResults = await Promise.all(batch.map(fn)); results.push(...batchResults); } return results; },
  processWithRetry: async <T, R>(items: T[], fn: (item: T) => Promise<R>, retries = 3): Promise<{ success: R[]; failed: T[] }> => { const success: R[] = [], failed: T[] = []; for (const item of items) { let done = false; for (let i = 0; i < retries && !done; i++) { try { success.push(await fn(item)); done = true; } catch {} } if (!done) failed.push(item); } return { success, failed }; },
  chunk: <T>(items: T[], size: number): T[][] => { const chunks: T[][] = []; for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size)); return chunks; },
};
