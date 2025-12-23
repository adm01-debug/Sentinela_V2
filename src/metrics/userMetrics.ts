interface UserMetric { userId: string; action: string; timestamp: Date; metadata?: any; }
class UserMetrics {
  private metrics: UserMetric[] = [];
  track(userId: string, action: string, metadata?: any) { this.metrics.push({ userId, action, timestamp: new Date(), metadata }); }
  getByUser(userId: string): UserMetric[] { return this.metrics.filter(m => m.userId === userId); }
  getByAction(action: string): UserMetric[] { return this.metrics.filter(m => m.action === action); }
  countByAction(): Record<string, number> { return this.metrics.reduce((acc, m) => { acc[m.action] = (acc[m.action] || 0) + 1; return acc; }, {} as Record<string, number>); }
  getActiveUsers(sinceMinutes = 30): string[] { const since = Date.now() - sinceMinutes * 60 * 1000; return [...new Set(this.metrics.filter(m => m.timestamp.getTime() > since).map(m => m.userId))]; }
}
export const userMetrics = new UserMetrics();
