type ReportType = 'daily' | 'weekly' | 'monthly';
type ReportCallback = (type: ReportType) => void;
class ReportScheduler {
  private callbacks: Map<ReportType, NodeJS.Timeout> = new Map();
  schedule(type: ReportType, callback: ReportCallback) { const intervals: Record<ReportType, number> = { daily: 86400000, weekly: 604800000, monthly: 2592000000 }; const timer = setInterval(() => callback(type), intervals[type]); this.callbacks.set(type, timer); }
  unschedule(type: ReportType) { const timer = this.callbacks.get(type); if (timer) { clearInterval(timer); this.callbacks.delete(type); } }
  unscheduleAll() { this.callbacks.forEach(timer => clearInterval(timer)); this.callbacks.clear(); }
}
export const reportScheduler = new ReportScheduler();
