export interface RPOConfig { service: string; targetRPO: number; backupFrequency: number; lastBackup?: Date; }
export class RPOManager {
  private configs = new Map<string, RPOConfig>();
  configure(config: RPOConfig): void { this.configs.set(config.service, config); }
  recordBackup(service: string): void { const config = this.configs.get(service); if (config) config.lastBackup = new Date(); }
  getCurrentRPO(service: string): number { const config = this.configs.get(service); if (!config?.lastBackup) return Infinity; return Date.now() - config.lastBackup.getTime(); }
  isWithinTarget(service: string): boolean { const config = this.configs.get(service); if (!config) return false; return this.getCurrentRPO(service) <= config.targetRPO; }
  getAtRisk(): RPOConfig[] { return Array.from(this.configs.values()).filter(c => !this.isWithinTarget(c.service)); }
}
export const rpoManager = new RPOManager();
