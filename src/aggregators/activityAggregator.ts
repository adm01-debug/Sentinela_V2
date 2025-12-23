import type { Activity } from '@/entities/Activity';
export const activityAggregator = {
  byApplication: (activities: Activity[]) => activities.reduce((acc, a) => { acc[a.application] = (acc[a.application] || 0) + a.duration; return acc; }, {} as Record<string, number>),
  byType: (activities: Activity[]) => activities.reduce((acc, a) => { acc[a.type] = (acc[a.type] || 0) + a.duration; return acc; }, {} as Record<string, number>),
  byHour: (activities: Activity[]) => activities.reduce((acc, a) => { const hour = a.startedAt.getHours(); acc[hour] = (acc[hour] || 0) + a.duration; return acc; }, {} as Record<number, number>),
  byProductivity: (activities: Activity[]) => ({ productive: activities.filter(a => a.isProductive).reduce((sum, a) => sum + a.duration, 0), unproductive: activities.filter(a => !a.isProductive).reduce((sum, a) => sum + a.duration, 0) }),
  topApplications: (activities: Activity[], limit = 5) => { const byApp = activityAggregator.byApplication(activities); return Object.entries(byApp).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([name, duration]) => ({ name, duration })); },
};
