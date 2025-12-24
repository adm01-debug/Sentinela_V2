export interface ReplicationConfig { sourceId: string; targetId: string; mode: 'sync' | 'async'; interval?: number; }
export interface ReplicatedData { id: string; data: any; version: number; replicatedAt: Date; source: string; }
export class Replicator {
  private configs: ReplicationConfig[] = [];
  private data = new Map<string, ReplicatedData>();
  configure(config: ReplicationConfig): void { this.configs.push(config); }
  async replicate(sourceId: string, data: any): Promise<ReplicatedData> { const existing = this.data.get(sourceId); const version = existing ? existing.version + 1 : 1; const replicated: ReplicatedData = { id: crypto.randomUUID(), data, version, replicatedAt: new Date(), source: sourceId }; this.data.set(sourceId, replicated); return replicated; }
  get(sourceId: string): ReplicatedData | undefined { return this.data.get(sourceId); }
  getVersion(sourceId: string): number { return this.data.get(sourceId)?.version || 0; }
}
export const replicator = new Replicator();
