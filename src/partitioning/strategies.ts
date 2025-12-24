import { PartitionBoundary } from './types';

export class RangePartitionStrategy {
  constructor(private interval: 'day' | 'week' | 'month' | 'year') {}
  
  generateBoundaries(from: Date, to: Date): PartitionBoundary[] {
    const boundaries: PartitionBoundary[] = [];
    let current = new Date(from);
    while (current < to) {
      const next = this.addInterval(current);
      boundaries.push({ type: 'range', from: new Date(current), to: next });
      current = next;
    }
    return boundaries;
  }
  
  private addInterval(date: Date): Date {
    const result = new Date(date);
    switch (this.interval) {
      case 'day': result.setDate(result.getDate() + 1); break;
      case 'week': result.setDate(result.getDate() + 7); break;
      case 'month': result.setMonth(result.getMonth() + 1); break;
      case 'year': result.setFullYear(result.getFullYear() + 1); break;
    }
    return result;
  }
}

export class ListPartitionStrategy {
  generateBoundaries(values: unknown[][]): PartitionBoundary[] {
    return values.map(v => ({ type: 'list', values: v }));
  }
}

export class HashPartitionStrategy {
  constructor(private partitionCount: number) {}
  getPartitionIndex(key: unknown): number { return Math.abs(this.hash(String(key))) % this.partitionCount; }
  private hash(str: string): number { let h = 0; for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; } return h; }
}