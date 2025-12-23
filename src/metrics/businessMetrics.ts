interface BusinessMetric { name: string; value: number; period: string; calculatedAt: Date; }
class BusinessMetrics {
  private metrics: BusinessMetric[] = [];
  record(name: string, value: number, period: string) { this.metrics.push({ name, value, period, calculatedAt: new Date() }); }
  calculateProductivity(productive: number, total: number): number { return total > 0 ? (productive / total) * 100 : 0; }
  calculateGrowth(current: number, previous: number): number { return previous > 0 ? ((current - previous) / previous) * 100 : 0; }
  calculateAverage(values: number[]): number { return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0; }
  getByName(name: string): BusinessMetric[] { return this.metrics.filter(m => m.name === name); }
  getAll(): BusinessMetric[] { return [...this.metrics]; }
}
export const businessMetrics = new BusinessMetrics();
