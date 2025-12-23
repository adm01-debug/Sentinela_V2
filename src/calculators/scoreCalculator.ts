export const scoreCalculator = {
  calculateEmployeeScore: (metrics: { productivity: number; attendance: number; violations: number }): number => { const prodScore = metrics.productivity * 0.5; const attScore = metrics.attendance * 0.3; const violPenalty = Math.min(20, metrics.violations * 5); return Math.max(0, Math.min(100, prodScore + attScore - violPenalty)); },
  calculateTeamScore: (employeeScores: number[]): number => employeeScores.length > 0 ? employeeScores.reduce((a, b) => a + b, 0) / employeeScores.length : 0,
  getRating: (score: number): 1 | 2 | 3 | 4 | 5 => { if (score >= 90) return 5; if (score >= 75) return 4; if (score >= 60) return 3; if (score >= 40) return 2; return 1; },
  normalizeScore: (value: number, min: number, max: number): number => ((value - min) / (max - min)) * 100,
};
