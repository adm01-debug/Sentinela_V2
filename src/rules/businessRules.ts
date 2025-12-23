export const businessRules = {
  canDeleteEmployee: (employee: any, violations: any[]): { allowed: boolean; reason?: string } => { if (violations.some(v => v.status === 'pending')) return { allowed: false, reason: 'Has pending violations' }; return { allowed: true }; },
  canGenerateReport: (user: any, reportType: string): boolean => { const allowedTypes: Record<string, string[]> = { admin: ['daily', 'weekly', 'monthly', 'productivity', 'violations'], manager: ['daily', 'weekly', 'productivity'], employee: ['daily'] }; return allowedTypes[user.role]?.includes(reportType) ?? false; },
  getMaxScreenshotsPerHour: (plan: string): number => { const limits: Record<string, number> = { free: 6, basic: 12, pro: 30, enterprise: 60 }; return limits[plan] || 6; },
  isWorkingHours: (date: Date, workStart = 9, workEnd = 18): boolean => { const hour = date.getHours(); return hour >= workStart && hour < workEnd; },
};
