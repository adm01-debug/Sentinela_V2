export interface DataVersion { id: string; version: number; hash: string; timestamp: number; }
export class ConflictDetector {
  private versions = new Map<string, DataVersion>();
  setVersion(id: string, data: any): void { const hash = this.hashData(data); const current = this.versions.get(id); this.versions.set(id, { id, version: (current?.version || 0) + 1, hash, timestamp: Date.now() }); }
  hasConflict(id: string, remoteVersion: DataVersion): boolean { const local = this.versions.get(id); if (!local) return false; return local.version !== remoteVersion.version && local.hash !== remoteVersion.hash; }
  private hashData(data: any): string { return btoa(JSON.stringify(data)).slice(0, 16); }
  getVersion(id: string): DataVersion | undefined { return this.versions.get(id); }
}
export const conflictDetector = new ConflictDetector();
