export interface Conversion { id: string; goal: string; value?: number; timestamp: Date; attributes: Record<string, any>; }
export class ConversionTracker {
  private conversions: Conversion[] = [];
  private goals = new Map<string, { count: number; value: number }>();
  track(goal: string, value?: number, attributes: Record<string, any> = {}): Conversion { const conversion: Conversion = { id: crypto.randomUUID(), goal, value, timestamp: new Date(), attributes }; this.conversions.push(conversion); const goalData = this.goals.get(goal) || { count: 0, value: 0 }; goalData.count++; goalData.value += value || 0; this.goals.set(goal, goalData); return conversion; }
  getByGoal(goal: string): Conversion[] { return this.conversions.filter(c => c.goal === goal); }
  getGoalStats(goal: string): { count: number; value: number } { return this.goals.get(goal) || { count: 0, value: 0 }; }
  getConversionRate(goal: string, totalVisitors: number): number { const stats = this.getGoalStats(goal); return (stats.count / totalVisitors) * 100; }
}
export const conversionTracker = new ConversionTracker();
