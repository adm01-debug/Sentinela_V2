export interface OutboxMessage {
  id: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: unknown;
  status: OutboxStatus;
  createdAt: Date;
  processedAt?: Date;
  retries: number;
  error?: string;
}

export type OutboxStatus = 'pending' | 'processing' | 'published' | 'failed';

export interface OutboxConfig {
  tableName: string;
  batchSize: number;
  retryLimit: number;
  retryDelayMs: number;
  cleanupAfterDays: number;
}

export interface OutboxEntry {
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: unknown;
}