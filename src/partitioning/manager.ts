import { Partition, PartitionStats } from './types';

export class PartitionManager {
  private partitions: Map<string, Partition> = new Map();
  private stats: Map<string, PartitionStats> = new Map();
  
  add(partition: Partition): void { this.partitions.set(partition.id, partition); }
  remove(id: string): boolean { this.stats.delete(id); return this.partitions.delete(id); }
  get(id: string): Partition | undefined { return this.partitions.get(id); }
  getAll(): Partition[] { return Array.from(this.partitions.values()); }
  
  updateStats(id: string, stats: Partial<PartitionStats>): void {
    const current = this.stats.get(id) ?? { id, rowCount: 0, sizeBytes: 0, lastUpdated: new Date() };
    this.stats.set(id, { ...current, ...stats, lastUpdated: new Date() });
  }
  
  getStats(id: string): PartitionStats | undefined { return this.stats.get(id); }
  
  findPartitionsNeedingMaintenance(maxRows: number): Partition[] {
    return this.getAll().filter(p => {
      const stats = this.stats.get(p.id);
      return stats && stats.rowCount > maxRows;
    });
  }
}