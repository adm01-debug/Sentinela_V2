export interface UptimeCheck { url: string; interval: number; timeout: number; }
export class UptimeMonitor {
  private checks = new Map<string, { config: UptimeCheck; timer: NodeJS.Timeout; status: boolean }>();
  addCheck(name: string, config: UptimeCheck): void { const timer = setInterval(() => this.performCheck(name), config.interval); this.checks.set(name, { config, timer, status: true }); this.performCheck(name); }
  private async performCheck(name: string): Promise<void> { const check = this.checks.get(name); if (!check) return; try { const controller = new AbortController(); setTimeout(() => controller.abort(), check.config.timeout); const response = await fetch(check.config.url, { signal: controller.signal }); check.status = response.ok; } catch { check.status = false; } }
  getStatus(name: string): boolean | undefined { return this.checks.get(name)?.status; }
  removeCheck(name: string): void { const check = this.checks.get(name); if (check) clearInterval(check.timer); this.checks.delete(name); }
}
export const uptimeMonitor = new UptimeMonitor();
