import { Partition, PartitionConfig } from './types';

export class Partitioner {
  private partitions: Map<string, Partition> = new Map();
  
  constructor(private config: PartitionConfig) {}
  
  createPartition(partition: Partition): void { this.partitions.set(partition.id, partition); }
  getPartition(id: string): Partition | undefined { return this.partitions.get(id); }
  
  findPartitionForValue(value: unknown): Partition | undefined {
    switch (this.config.strategy) {
      case 'range': return this.findRangePartition(value);
      case 'hash': return this.findHashPartition(value);
      case 'list': return this.findListPartition(value);
    }
  }
  
  private findRangePartition(value: unknown): Partition | undefined {
    for (const p of this.partitions.values()) {
      if (value >= p.minValue && value < p.maxValue) return p;
    }
    return undefined;
  }
  
  private findHashPartition(value: unknown): Partition | undefined {
    const hash = this.hash(String(value));
    const index = hash % this.partitions.size;
    return Array.from(this.partitions.values())[index];
  }
  
  private findListPartition(value: unknown): Partition | undefined {
    for (const p of this.partitions.values()) {
      if (Array.isArray(p.minValue) && p.minValue.includes(value)) return p;
    }
    return undefined;
  }
  
  private hash(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i++) hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
    return Math.abs(hash);
  }
}