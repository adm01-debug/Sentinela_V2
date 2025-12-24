export interface LoadConfig { target: string; type: 'database' | 'api' | 'file'; mode: 'insert' | 'upsert' | 'replace'; options?: Record<string, any>; }
export interface LoadResult { loaded: number; failed: number; loadedAt: Date; }
export class Loader {
  async load(config: LoadConfig, data: any[]): Promise<LoadResult> { console.log('Loading to ' + config.target); return { loaded: data.length, failed: 0, loadedAt: new Date() }; }
  async loadBatch(config: LoadConfig, data: any[], batchSize: number): Promise<LoadResult> { let loaded = 0, failed = 0; for (let i = 0; i < data.length; i += batchSize) { const batch = data.slice(i, i + batchSize); const result = await this.load(config, batch); loaded += result.loaded; failed += result.failed; } return { loaded, failed, loadedAt: new Date() }; }
}
export const loader = new Loader();
