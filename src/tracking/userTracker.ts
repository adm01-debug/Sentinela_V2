export interface UserSession { id: string; userId?: string; startedAt: Date; lastActivity: Date; pageViews: number; events: number; }
export class UserTracker {
  private session: UserSession;
  constructor() { this.session = { id: crypto.randomUUID(), startedAt: new Date(), lastActivity: new Date(), pageViews: 0, events: 0 }; }
  identify(userId: string): void { this.session.userId = userId; }
  trackActivity(): void { this.session.lastActivity = new Date(); }
  incrementPageViews(): void { this.session.pageViews++; this.trackActivity(); }
  incrementEvents(): void { this.session.events++; this.trackActivity(); }
  getSession(): UserSession { return { ...this.session }; }
  getSessionDuration(): number { return Date.now() - this.session.startedAt.getTime(); }
}
export const userTracker = new UserTracker();
