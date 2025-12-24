export interface FailoverEvent { id: string; timestamp: Date; fromNode: string; toNode: string; reason: string; duration: number; success: boolean; }
export class FailoverLog {
  private events: FailoverEvent[] = [];
  log(fromNode: string, toNode: string, reason: string, duration: number, success: boolean): FailoverEvent { const event: FailoverEvent = { id: crypto.randomUUID(), timestamp: new Date(), fromNode, toNode, reason, duration, success }; this.events.push(event); return event; }
  getEvents(): FailoverEvent[] { return [...this.events]; }
  getByNode(nodeId: string): FailoverEvent[] { return this.events.filter(e => e.fromNode === nodeId || e.toNode === nodeId); }
  getRecent(hours = 24): FailoverEvent[] { const cutoff = new Date(Date.now() - hours * 3600000); return this.events.filter(e => e.timestamp >= cutoff); }
  getStats(): { total: number; successful: number; failed: number; avgDuration: number } { const successful = this.events.filter(e => e.success); return { total: this.events.length, successful: successful.length, failed: this.events.length - successful.length, avgDuration: successful.reduce((sum, e) => sum + e.duration, 0) / successful.length || 0 }; }
}
export const failoverLog = new FailoverLog();
