import { HealthResult, HealthStatus, SystemHealth } from './types';

export class HealthAggregator {
  aggregate(results: Map<string, HealthResult>, criticalChecks: Set<string>): SystemHealth {
    const checks: Record<string, HealthResult> = {};
    let overallStatus: HealthStatus = 'healthy';
    
    results.forEach((result, name) => {
      checks[name] = result;
      
      if (result.status === 'unhealthy') {
        if (criticalChecks.has(name)) overallStatus = 'unhealthy';
        else if (overallStatus === 'healthy') overallStatus = 'degraded';
      } else if (result.status === 'degraded' && overallStatus === 'healthy') {
        overallStatus = 'degraded';
      }
    });
    
    return { status: overallStatus, checks, timestamp: new Date() };
  }
}

export class HealthHistory {
  private history: SystemHealth[] = [];
  
  record(health: SystemHealth): void {
    this.history.push(health);
    if (this.history.length > 1000) this.history.shift();
  }
  
  getUptime(minutes: number = 60): number {
    const cutoff = Date.now() - minutes * 60 * 1000;
    const recent = this.history.filter(h => h.timestamp.getTime() > cutoff);
    if (recent.length === 0) return 1;
    return recent.filter(h => h.status === 'healthy').length / recent.length;
  }
}