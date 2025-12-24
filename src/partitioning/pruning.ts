import { Partition } from './types';
import { PartitionManager } from './partitionManager';

export class PartitionPruner {
  constructor(private manager: PartitionManager) {}
  
  async pruneOldPartitions(tableName: string, retentionDays: number): Promise<string[]> {
    const partitions = await this.manager.getPartitions(tableName);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);
    const toDelete = partitions.filter(p => p.createdAt < cutoff);
    for (const p of toDelete) await this.manager.dropPartition(tableName, p.name);
    return toDelete.map(p => p.name);
  }
  
  async pruneEmptyPartitions(tableName: string): Promise<string[]> {
    const partitions = await this.manager.getPartitions(tableName);
    const empty = partitions.filter(p => p.rowCount === 0);
    for (const p of empty) await this.manager.dropPartition(tableName, p.name);
    return empty.map(p => p.name);
  }
  
  async getPartitionsToCreate(tableName: string, lookAheadDays: number): Promise<Date[]> {
    const dates: Date[] = [];
    for (let i = 0; i < lookAheadDays; i++) { const d = new Date(); d.setDate(d.getDate() + i); dates.push(d); }
    return dates;
  }
}