export interface TrapEvent { id: string; type: string; source: string; timestamp: Date; data: any; }
export class TrapDetector {
  private events: TrapEvent[] = [];
  private handlers: ((e: TrapEvent) => void)[] = [];
  detect(type: string, source: string, data: any): TrapEvent { const event: TrapEvent = { id: crypto.randomUUID(), type, source, timestamp: new Date(), data }; this.events.push(event); this.handlers.forEach(h => h(event)); return event; }
  onTrap(handler: (e: TrapEvent) => void): void { this.handlers.push(handler); }
  getEvents(): TrapEvent[] { return [...this.events]; }
  getByType(type: string): TrapEvent[] { return this.events.filter(e => e.type === type); }
}
export const trapDetector = new TrapDetector();
