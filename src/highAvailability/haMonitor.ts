import { haCluster } from './haCluster';
import { quorum } from './quorum';
export interface HAEvent { type: 'election' | 'failover' | 'quorum_lost' | 'node_joined' | 'node_left'; timestamp: Date; details: any; }
export class HAMonitor {
  private events: HAEvent[] = [];
  private handlers: ((event: HAEvent) => void)[] = [];
  log(type: HAEvent['type'], details: any): void { const event: HAEvent = { type, timestamp: new Date(), details }; this.events.push(event); this.handlers.forEach(h => h(event)); }
  onEvent(handler: (event: HAEvent) => void): void { this.handlers.push(handler); }
  getStatus(): { primary: string | null; quorum: boolean; nodes: number; healthy: number } { const primary = haCluster.getPrimary(); const q = quorum.getStatus(); return { primary: primary?.id || null, quorum: q.hasQuorum, nodes: q.total, healthy: q.healthy }; }
  getEvents(): HAEvent[] { return [...this.events]; }
}
export const haMonitor = new HAMonitor();
