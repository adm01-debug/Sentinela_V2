import { SystemHealth, HealthStatus } from './types';

export class HealthReporter {
  private webhooks: string[] = [];
  
  addWebhook(url: string): void { this.webhooks.push(url); }
  
  async report(health: SystemHealth): Promise<void> {
    if (health.status !== 'healthy') {
      await this.sendAlerts(health);
    }
  }
  
  private async sendAlerts(health: SystemHealth): Promise<void> {
    console.log('Health alert:', health.status);
  }
  
  toJSON(health: SystemHealth): string { return JSON.stringify(health, null, 2); }
  
  toPrometheus(health: SystemHealth): string {
    const lines: string[] = [];
    lines.push('system_health_status ' + (health.status === 'healthy' ? 1 : 0));
    Object.entries(health.checks).forEach(([name, result]) => {
      lines.push('health_check_status{name="' + name + '"} ' + (result.status === 'healthy' ? 1 : 0));
      lines.push('health_check_duration_ms{name="' + name + '"} ' + result.duration);
    });
    return lines.join('\n');
  }
}