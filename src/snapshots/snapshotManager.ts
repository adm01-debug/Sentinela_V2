export interface Snapshot { id: string; name: string; timestamp: Date; data: any; metadata?: Record<string, any>; }
export class SnapshotManager {
  private snapshots = new Map<string, Snapshot>();
  create(name: string, data: any, metadata?: Record<string, any>): Snapshot { const snapshot: Snapshot = { id: crypto.randomUUID(), name, timestamp: new Date(), data: JSON.parse(JSON.stringify(data)), metadata }; this.snapshots.set(snapshot.id, snapshot); return snapshot; }
  get(id: string): Snapshot | undefined { return this.snapshots.get(id); }
  getByName(name: string): Snapshot[] { return Array.from(this.snapshots.values()).filter(s => s.name === name); }
  list(): Snapshot[] { return Array.from(this.snapshots.values()); }
  delete(id: string): boolean { return this.snapshots.delete(id); }
}
export const snapshotManager = new SnapshotManager();
