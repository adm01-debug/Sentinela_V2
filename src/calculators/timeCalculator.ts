export const timeCalculator = {
  totalWorkHours: (activities: { duration: number }[]): number => activities.reduce((sum, a) => sum + a.duration, 0) / 3600,
  averageSessionDuration: (sessions: { startedAt: Date; endedAt?: Date }[]): number => { const completed = sessions.filter(s => s.endedAt); if (!completed.length) return 0; const total = completed.reduce((sum, s) => sum + (s.endedAt!.getTime() - s.startedAt.getTime()), 0); return total / completed.length / 1000; },
  idlePercentage: (idleTime: number, totalTime: number): number => totalTime > 0 ? (idleTime / totalTime) * 100 : 0,
  overtimeHours: (workedHours: number, expectedHours = 8): number => Math.max(0, workedHours - expectedHours),
  breakTime: (activities: { type: string; duration: number }[]): number => activities.filter(a => a.type === 'break').reduce((sum, a) => sum + a.duration, 0),
};
