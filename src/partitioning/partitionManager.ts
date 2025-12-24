import { PartitionConfig, Partition, PartitionBoundary } from './types';

export class PartitionManager {
  private partitions: Map<string, Partition[]> = new Map();
  
  async createPartition(config: PartitionConfig, boundary: PartitionBoundary): Promise<Partition> {
    const partitionName = this.generatePartitionName(config.tableName, boundary);
    const partition: Partition = {
      name: partitionName, tableName: config.tableName, constraint: this.buildConstraint(config.partitionKey, boundary),
      rowCount: 0, sizeBytes: 0, createdAt: new Date()
    };
    const existing = this.partitions.get(config.tableName) ?? [];
    existing.push(partition);
    this.partitions.set(config.tableName, existing);
    return partition;
  }
  
  async dropPartition(tableName: string, partitionName: string): Promise<void> {
    const partitions = this.partitions.get(tableName);
    if (partitions) this.partitions.set(tableName, partitions.filter(p => p.name !== partitionName));
  }
  
  async getPartitions(tableName: string): Promise<Partition[]> { return this.partitions.get(tableName) ?? []; }
  
  async getPartitionStats(tableName: string): Promise<PartitionStats> {
    const partitions = await this.getPartitions(tableName);
    return { totalPartitions: partitions.length, totalRows: partitions.reduce((sum, p) => sum + p.rowCount, 0), totalSizeBytes: partitions.reduce((sum, p) => sum + p.sizeBytes, 0) };
  }
  
  private generatePartitionName(tableName: string, boundary: PartitionBoundary): string {
    const suffix = boundary.type === 'range' ? String(boundary.from) : boundary.values?.join('_');
    return tableName + '_p_' + suffix;
  }
  
  private buildConstraint(key: string, boundary: PartitionBoundary): string {
    if (boundary.type === 'range') return key + ' >= ' + boundary.from + ' AND ' + key + ' < ' + boundary.to;
    return key + ' IN (' + boundary.values?.join(', ') + ')';
  }
}

export interface PartitionStats { totalPartitions: number; totalRows: number; totalSizeBytes: number; }