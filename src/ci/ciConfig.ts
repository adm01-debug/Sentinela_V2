export interface CIConfig { name: string; triggers: ('push' | 'pull_request' | 'schedule')[]; branches: string[]; nodeVersion: string; steps: string[]; }
export const defaultCIConfig: CIConfig = { name: 'CI', triggers: ['push', 'pull_request'], branches: ['main', 'develop'], nodeVersion: '20', steps: ['checkout', 'install', 'lint', 'test', 'build'] };
export class CIConfigManager {
  private config: CIConfig = { ...defaultCIConfig };
  get(): CIConfig { return { ...this.config }; }
  set(config: Partial<CIConfig>): void { this.config = { ...this.config, ...config }; }
  addStep(step: string): void { this.config.steps.push(step); }
  addBranch(branch: string): void { this.config.branches.push(branch); }
}
export const ciConfigManager = new CIConfigManager();
