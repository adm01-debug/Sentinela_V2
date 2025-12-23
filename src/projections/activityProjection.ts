export interface ActivityProjection { date: string; totalHours: number; productiveHours: number; productivity: number; topApp: string; }
export function projectActivitiesByDay(activities: any[]): ActivityProjection[] {
  const byDay = activities.reduce((acc, a) => { const date = a.started_at.split('T')[0]; acc[date] = acc[date] || []; acc[date].push(a); return acc; }, {} as Record<string, any[]>);
  return Object.entries(byDay).map(([date, acts]) => {
    const totalSeconds = acts.reduce((sum, a) => sum + a.duration, 0);
    const productiveSeconds = acts.filter((a: any) => a.is_productive).reduce((sum, a) => sum + a.duration, 0);
    const appCounts = acts.reduce((acc, a) => { acc[a.application] = (acc[a.application] || 0) + a.duration; return acc; }, {} as Record<string, number>);
    const topApp = Object.entries(appCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    return { date, totalHours: totalSeconds / 3600, productiveHours: productiveSeconds / 3600, productivity: totalSeconds > 0 ? (productiveSeconds / totalSeconds) * 100 : 0, topApp };
  });
}
