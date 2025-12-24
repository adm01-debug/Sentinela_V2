export interface EmailEvent { id: string; emailId: string; type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed'; timestamp: Date; metadata?: Record<string, any>; }
export class EmailTracker {
  private events: EmailEvent[] = [];
  track(emailId: string, type: EmailEvent['type'], metadata?: Record<string, any>): void { this.events.push({ id: crypto.randomUUID(), emailId, type, timestamp: new Date(), metadata }); }
  getEvents(emailId: string): EmailEvent[] { return this.events.filter(e => e.emailId === emailId); }
  getStats(): { sent: number; delivered: number; opened: number; clicked: number; bounced: number } { const count = (type: EmailEvent['type']) => this.events.filter(e => e.type === type).length; return { sent: count('sent'), delivered: count('delivered'), opened: count('opened'), clicked: count('clicked'), bounced: count('bounced') }; }
  getOpenRate(): number { const stats = this.getStats(); return stats.delivered ? (stats.opened / stats.delivered) * 100 : 0; }
}
export const emailTracker = new EmailTracker();
