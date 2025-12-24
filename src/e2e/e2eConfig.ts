export interface E2EConfig { baseUrl: string; timeout: number; headless: boolean; screenshotsDir: string; }
export const defaultE2EConfig: E2EConfig = { baseUrl: 'http://localhost:3000', timeout: 30000, headless: true, screenshotsDir: './screenshots' };
export class E2EConfigManager {
  private config: E2EConfig = { ...defaultE2EConfig };
  get(): E2EConfig { return { ...this.config }; }
  set(config: Partial<E2EConfig>): void { this.config = { ...this.config, ...config }; }
  reset(): void { this.config = { ...defaultE2EConfig }; }
}
export const e2eConfigManager = new E2EConfigManager();
