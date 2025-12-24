export interface ReplayConfig {
  fromTimestamp?: Date;
  toTimestamp?: Date;
  fromOffset?: number;
  toOffset?: number;
  filter?: MessageFilter;
  speedFactor: number;
}

export interface MessageFilter {
  eventTypes?: string[];
  aggregateIds?: string[];
  correlationIds?: string[];
}

export interface ReplayProgress {
  totalMessages: number;
  processedMessages: number;
  currentOffset: number;
  startedAt: Date;
  estimatedCompletion?: Date;
  status: ReplayStatus;
}

export type ReplayStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed';

export interface StoredMessage {
  offset: number;
  timestamp: Date;
  eventType: string;
  aggregateId: string;
  payload: unknown;
  metadata: Record<string, string>;
}