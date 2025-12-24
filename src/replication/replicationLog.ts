export interface ReplicationEvent { id: string; type: 'replicated' | 'conflict' | 'failed' | 'resolved'; sourceId: string; targetId: string; timestamp: Date; details?: any; }
export class ReplicationLog {
  private events: ReplicationEvent[] = [];
  log(type: ReplicationEvent['type'], sourceId: string, targetId: string, details?: any): void { this.events.push({ id: crypto.randomUUID(), type, sourceId, targetId, timestamp: new Date(), details }); }
  getEvents(): ReplicationEvent[] { return [...this.events]; }
  getByType(type: ReplicationEvent['type']): ReplicationEvent[] { return this.events.filter(e => e.type === type); }
  getRecent(hours = 24): ReplicationEvent[] { const cutoff = new Date(Date.now() - hours * 3600000); return this.events.filter(e => e.timestamp >= cutoff); }
}
export const replicationLog = new ReplicationLog();
