import { ServiceDefinition, HealthCheckConfig } from './types';

export class HealthChecker {
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private status: Map<string, HealthStatus> = new Map();
  
  startChecking(service: ServiceDefinition, onStatusChange: (healthy: boolean) => void): void {
    const check = async () => {
      const healthy = await this.performCheck(service.healthCheck);
      const prev = this.status.get(service.name);
      this.status.set(service.name, { healthy, lastCheck: new Date(), consecutiveFailures: healthy ? 0 : (prev?.consecutiveFailures ?? 0) + 1 });
      if (prev?.healthy !== healthy) onStatusChange(healthy);
    };
    check();
    this.timers.set(service.name, setInterval(check, service.healthCheck.interval));
  }
  
  stopChecking(serviceName: string): void {
    const timer = this.timers.get(serviceName);
    if (timer) { clearInterval(timer); this.timers.delete(serviceName); }
  }
  
  private async performCheck(config: HealthCheckConfig): Promise<boolean> {
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), config.timeout);
      return true;
    } catch { return false; }
  }
  
  getStatus(serviceName: string): HealthStatus | undefined { return this.status.get(serviceName); }
}

interface HealthStatus { healthy: boolean; lastCheck: Date; consecutiveFailures: number; }