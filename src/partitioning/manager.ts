/**
 * @fileoverview Partition Manager
 * @module @sentinela/core/partitioning
 */
export interface Partition { id: number; startKey: string; endKey: string; }
export class PartitionManager {
  private partitions: Partition[] = [];
  create(count: number): void {
    for (let i = 0; i < count; i++) {
      this.partitions.push({ id: i, startKey: '', endKey: '' });
    }
  }
  getPartition(key: string): Partition {
    const hash = key.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return this.partitions[hash % this.partitions.length];
  }
  list(): Partition[] { return this.partitions; }
}
