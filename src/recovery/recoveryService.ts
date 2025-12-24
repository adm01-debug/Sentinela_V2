export interface RecoveryPoint { id: string; timestamp: Date; description: string; data: any; }
export class RecoveryService {
  private points: RecoveryPoint[] = [];
  createPoint(description: string, data: any): RecoveryPoint { const point: RecoveryPoint = { id: crypto.randomUUID(), timestamp: new Date(), description, data }; this.points.push(point); return point; }
  getPoints(): RecoveryPoint[] { return [...this.points]; }
  getLatest(): RecoveryPoint | null { return this.points[this.points.length - 1] || null; }
  restore(id: string): any | null { const point = this.points.find(p => p.id === id); return point?.data || null; }
  deleteOlderThan(date: Date): number { const before = this.points.length; this.points = this.points.filter(p => p.timestamp >= date); return before - this.points.length; }
}
export const recoveryService = new RecoveryService();
