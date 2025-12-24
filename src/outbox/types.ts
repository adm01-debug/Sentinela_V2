// Outbox Pattern Types
export interface OutboxMessage {
  id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  payload: unknown;
  metadata: OutboxMetadata;
  status: OutboxStatus;
  createdAt: Date;
  processedAt?: Date;
  retryCount: number;
  lastError?: string;
}

export interface OutboxMetadata {
  correlationId: string;
  causationId?: string;
  userId?: string;
  tenantId?: string;
  destination?: string;
  headers?: Record<string, string>;
}

export enum OutboxStatus {
  Pending = 'pending',
  Processing = 'processing',
  Processed = 'processed',
  Failed = 'failed',
  DeadLetter = 'dead_letter'
}

export interface OutboxConfig {
  batchSize: number;
  pollIntervalMs: number;
  maxRetries: number;
  retryDelayMs: number;
  lockTimeoutMs: number;
  cleanupAfterDays: number;
}

export const DEFAULT_OUTBOX_CONFIG: OutboxConfig = {
  batchSize: 100,
  pollIntervalMs: 1000,
  maxRetries: 5,
  retryDelayMs: 5000,
  lockTimeoutMs: 30000,
  cleanupAfterDays: 7
};

export interface MessagePublisher {
  publish(message: OutboxMessage): Promise<void>;
  publishBatch(messages: OutboxMessage[]): Promise<PublishResult[]>;
}

export interface PublishResult {
  messageId: string;
  success: boolean;
  error?: string;
}

export interface OutboxStats {
  pending: number;
  processing: number;
  processed: number;
  failed: number;
  deadLetter: number;
  avgProcessingTimeMs: number;
  messagesPerSecond: number;
}
