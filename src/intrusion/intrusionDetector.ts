export interface IntrusionEvent { id: string; type: string; source: string; timestamp: Date; severity: 'low' | 'medium' | 'high' | 'critical'; details: string; }
export class IntrusionDetector {
  private events: IntrusionEvent[] = [];
  private handlers: ((e: IntrusionEvent) => void)[] = [];
  detect(type: string, source: string, severity: IntrusionEvent['severity'], details: string): IntrusionEvent { const event: IntrusionEvent = { id: crypto.randomUUID(), type, source, timestamp: new Date(), severity, details }; this.events.push(event); this.handlers.forEach(h => h(event)); return event; }
  onDetection(handler: (e: IntrusionEvent) => void): void { this.handlers.push(handler); }
  getEvents(): IntrusionEvent[] { return [...this.events]; }
  getBySeverity(severity: IntrusionEvent['severity']): IntrusionEvent[] { return this.events.filter(e => e.severity === severity); }
}
export const intrusionDetector = new IntrusionDetector();
