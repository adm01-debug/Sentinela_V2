export const productivityCalculator = {
  calculate: (productiveTime: number, totalTime: number): number => totalTime > 0 ? (productiveTime / totalTime) * 100 : 0,
  getScore: (productivity: number): 'low' | 'medium' | 'high' | 'excellent' => { if (productivity >= 90) return 'excellent'; if (productivity >= 70) return 'high'; if (productivity >= 50) return 'medium'; return 'low'; },
  calculateDaily: (activities: { duration: number; isProductive: boolean }[]): number => { const total = activities.reduce((sum, a) => sum + a.duration, 0); const productive = activities.filter(a => a.isProductive).reduce((sum, a) => sum + a.duration, 0); return productivityCalculator.calculate(productive, total); },
  calculateTrend: (values: number[]): 'up' | 'down' | 'stable' => { if (values.length < 2) return 'stable'; const recent = values.slice(-3).reduce((a, b) => a + b, 0) / 3; const older = values.slice(0, 3).reduce((a, b) => a + b, 0) / 3; if (recent > older + 5) return 'up'; if (recent < older - 5) return 'down'; return 'stable'; },
};
