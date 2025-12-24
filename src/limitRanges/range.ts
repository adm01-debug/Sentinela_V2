import { LimitRange, LimitRangeItem } from './types';

export class LimitRangeManager {
  private ranges: Map<string, LimitRange> = new Map();
  
  create(range: LimitRange): void { this.ranges.set(range.namespace + '/' + range.name, range); }
  delete(namespace: string, name: string): boolean { return this.ranges.delete(namespace + '/' + name); }
  get(namespace: string, name: string): LimitRange | undefined { return this.ranges.get(namespace + '/' + name); }
  
  getForNamespace(namespace: string): LimitRange[] {
    return Array.from(this.ranges.values()).filter(r => r.namespace === namespace);
  }
  
  getLimitsForType(namespace: string, type: LimitRangeItem['type']): LimitRangeItem | undefined {
    const ranges = this.getForNamespace(namespace);
    for (const range of ranges) {
      const item = range.limits.find(l => l.type === type);
      if (item) return item;
    }
    return undefined;
  }
}