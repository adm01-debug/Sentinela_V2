import { PartitionConfig } from './types';

export class RangePartitionStrategy {
  generatePartitions(min: number, max: number, count: number): { minValue: number; maxValue: number }[] {
    const step = (max - min) / count;
    const partitions = [];
    for (let i = 0; i < count; i++) {
      partitions.push({ minValue: min + i * step, maxValue: min + (i + 1) * step });
    }
    return partitions;
  }
}

export class DatePartitionStrategy {
  generateMonthlyPartitions(startDate: Date, months: number): { minValue: Date; maxValue: Date; name: string }[] {
    const partitions = [];
    for (let i = 0; i < months; i++) {
      const start = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      const end = new Date(startDate.getFullYear(), startDate.getMonth() + i + 1, 0);
      partitions.push({ minValue: start, maxValue: end, name: 'p' + start.getFullYear() + '_' + (start.getMonth() + 1) });
    }
    return partitions;
  }
}

export class ListPartitionStrategy {
  generatePartitions(values: unknown[][], names: string[]): { values: unknown[]; name: string }[] {
    return values.map((v, i) => ({ values: v, name: names[i] ?? 'p' + i }));
  }
}