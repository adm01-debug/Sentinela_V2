export type SyncMode = 'full' | 'incremental' | 'delta';
export interface SyncConfig { mode: SyncMode; batchSize: number; retryAttempts: number; conflictResolution: 'local' | 'remote' | 'manual'; }
export const defaultSyncConfig: SyncConfig = { mode: 'incremental', batchSize: 100, retryAttempts: 3, conflictResolution: 'remote' };
export class SyncStrategy {
  private config: SyncConfig;
  constructor(config: Partial<SyncConfig> = {}) { this.config = { ...defaultSyncConfig, ...config }; }
  getConfig(): SyncConfig { return this.config; }
  setMode(mode: SyncMode): void { this.config.mode = mode; }
  setBatchSize(size: number): void { this.config.batchSize = size; }
}
export const syncStrategy = new SyncStrategy();
