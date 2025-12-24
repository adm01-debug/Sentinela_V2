export interface TrackedEvent { id: string; name: string; category: string; properties: Record<string, any>; timestamp: Date; userId?: string; sessionId?: string; }
export class EventTracker {
  private events: TrackedEvent[] = [];
  private userId?: string;
  private sessionId = crypto.randomUUID();
  setUserId(userId: string): void { this.userId = userId; }
  track(name: string, category: string, properties: Record<string, any> = {}): TrackedEvent { const event: TrackedEvent = { id: crypto.randomUUID(), name, category, properties, timestamp: new Date(), userId: this.userId, sessionId: this.sessionId }; this.events.push(event); return event; }
  getEvents(): TrackedEvent[] { return [...this.events]; }
  getByCategory(category: string): TrackedEvent[] { return this.events.filter(e => e.category === category); }
  clear(): void { this.events = []; }
}
export const eventTracker = new EventTracker();
