import { FeatureFlag, featureFlagService } from './featureFlagService';
export interface FlagProviderConfig { source: 'local' | 'remote'; url?: string; refreshInterval?: number; }
export class FlagProvider {
  private config: FlagProviderConfig;
  private timer: NodeJS.Timeout | null = null;
  constructor(config: FlagProviderConfig) { this.config = config; }
  async load(): Promise<void> { if (this.config.source === 'remote' && this.config.url) { const response = await fetch(this.config.url); const flags: FeatureFlag[] = await response.json(); flags.forEach(f => featureFlagService.set(f)); } }
  startAutoRefresh(): void { if (this.config.refreshInterval) this.timer = setInterval(() => this.load(), this.config.refreshInterval); }
  stopAutoRefresh(): void { if (this.timer) { clearInterval(this.timer); this.timer = null; } }
}
