import { checkDatabaseHealth } from './databaseHealth';
import { checkCacheHealth } from './cacheHealth';
import { checkStorageHealth } from './storageHealth';
export interface HealthReport { status: 'healthy' | 'degraded' | 'unhealthy'; timestamp: string; checks: Record<string, any>; }
export async function runHealthChecks(): Promise<HealthReport> {
  const [db, cache, storage] = await Promise.all([checkDatabaseHealth(), checkCacheHealth(), checkStorageHealth()]);
  const checks = { database: db, cache, storage };
  const allHealthy = Object.values(checks).every((c: any) => c.healthy);
  const anyHealthy = Object.values(checks).some((c: any) => c.healthy);
  return { status: allHealthy ? 'healthy' : anyHealthy ? 'degraded' : 'unhealthy', timestamp: new Date().toISOString(), checks };
}
