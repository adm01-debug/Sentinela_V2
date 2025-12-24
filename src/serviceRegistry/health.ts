import { ServiceRegistration, RegistrationStatus } from './types';

export class HealthChecker {
  private checks: Map<string, NodeJS.Timeout> = new Map();
  
  startChecking(registration: ServiceRegistration, onUnhealthy: () => void): void {
    const config = registration.service.healthCheck;
    if (!config.enabled) return;
    
    const timer = setInterval(async () => {
      const healthy = await this.check(registration);
      if (!healthy) onUnhealthy();
    }, config.interval);
    
    this.checks.set(registration.id, timer);
  }
  
  stopChecking(id: string): void {
    const timer = this.checks.get(id);
    if (timer) { clearInterval(timer); this.checks.delete(id); }
  }
  
  private async check(registration: ServiceRegistration): Promise<boolean> {
    const endpoint = registration.service.endpoints[0];
    const url = endpoint.protocol + '://' + endpoint.host + ':' + endpoint.port + registration.service.healthCheck.endpoint;
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), registration.service.healthCheck.timeout);
      const response = await fetch(url, { signal: controller.signal });
      return response.ok;
    } catch { return false; }
  }
  
  stopAll(): void { this.checks.forEach(timer => clearInterval(timer)); this.checks.clear(); }
}