import { cacheInfra } from '@/infrastructure/cache/cacheInfra';
export async function checkCacheHealth(): Promise<{ healthy: boolean; latency: number }> {
  const start = Date.now();
  const testKey = '__health_check__';
  try { cacheInfra.set(testKey, 'test'); const value = cacheInfra.get(testKey); cacheInfra.delete(testKey); return { healthy: value === 'test', latency: Date.now() - start }; }
  catch { return { healthy: false, latency: Date.now() - start }; }
}
