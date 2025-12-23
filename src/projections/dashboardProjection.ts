export interface DashboardProjection { totalEmployees: number; activeEmployees: number; productivity: number; totalHours: number; violations: number; topApps: { name: string; hours: number }[]; }
export function projectDashboard(data: { employees: any[]; activities: any[]; violations: any[] }): DashboardProjection {
  const activeEmployees = data.employees.filter(e => e.status === 'active').length;
  const totalHours = data.activities.reduce((sum, a) => sum + a.duration, 0) / 3600;
  const productiveHours = data.activities.filter(a => a.is_productive).reduce((sum, a) => sum + a.duration, 0) / 3600;
  const appHours = data.activities.reduce((acc, a) => { acc[a.application] = (acc[a.application] || 0) + a.duration / 3600; return acc; }, {} as Record<string, number>);
  const topApps = Object.entries(appHours).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, hours]) => ({ name, hours: hours as number }));
  return { totalEmployees: data.employees.length, activeEmployees, productivity: totalHours > 0 ? (productiveHours / totalHours) * 100 : 0, totalHours, violations: data.violations.length, topApps };
}
