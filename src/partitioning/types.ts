export interface PartitionConfig {
  tableName: string;
  partitionKey: string;
  strategy: PartitionStrategy;
  retentionDays?: number;
}

export type PartitionStrategy = 'range' | 'list' | 'hash' | 'composite';

export interface Partition {
  name: string;
  tableName: string;
  constraint: string;
  rowCount: number;
  sizeBytes: number;
  createdAt: Date;
}

export interface PartitionBoundary {
  type: 'range' | 'list';
  from?: unknown;
  to?: unknown;
  values?: unknown[];
}