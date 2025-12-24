import { CDNStats } from './types';

export class CDNAnalytics {
  private history: { timestamp: Date; stats: CDNStats }[] = [];
  
  record(stats: CDNStats): void {
    this.history.push({ timestamp: new Date(), stats: { ...stats } });
    if (this.history.length > 10000) this.history.shift();
  }
  
  getHitRate(minutes: number = 60): number {
    const cutoff = Date.now() - minutes * 60 * 1000;
    const recent = this.history.filter(h => h.timestamp.getTime() > cutoff);
    if (recent.length === 0) return 0;
    const totals = recent.reduce((acc, h) => ({ hits: acc.hits + h.stats.hits, requests: acc.requests + h.stats.requests }), { hits: 0, requests: 0 });
    return totals.requests ? totals.hits / totals.requests : 0;
  }
  
  getBandwidthUsage(minutes: number = 60): number {
    const cutoff = Date.now() - minutes * 60 * 1000;
    return this.history.filter(h => h.timestamp.getTime() > cutoff).reduce((sum, h) => sum + h.stats.bandwidth, 0);
  }
  
  getTopPaths(limit: number = 10): { path: string; count: number }[] { return []; }
}