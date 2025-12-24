// Data Aggregator
export type AggregateFunction = "sum" | "avg" | "min" | "max" | "count";
export class DataAggregator {
  aggregate(data: number[], fn: AggregateFunction): number {
    switch (fn) {
      case "sum": return data.reduce((a, b) => a + b, 0);
      case "avg": return data.length ? data.reduce((a, b) => a + b, 0) / data.length : 0;
      case "min": return Math.min(...data);
      case "max": return Math.max(...data);
      case "count": return data.length;
    }
  }
  groupBy<T>(items: T[], key: keyof T): Map<unknown, T[]> { const groups = new Map<unknown, T[]>(); for (const item of items) { const k = item[key]; if (!groups.has(k)) groups.set(k, []); groups.get(k)!.push(item); } return groups; }
}
