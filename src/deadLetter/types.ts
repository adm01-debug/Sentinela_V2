export interface DeadLetterMessage {
  id: string;
  originalQueue: string;
  payload: unknown;
  error: string;
  retryCount: number;
  maxRetries: number;
  failedAt: Date;
  metadata: Record<string, string>;
}

export interface DLQConfig {
  maxRetries: number;
  retryDelay: number;
  expirationDays: number;
  alertThreshold: number;
}

export interface DLQStats {
  totalMessages: number;
  byQueue: Record<string, number>;
  byError: Record<string, number>;
  oldestMessage?: Date;
  newestMessage?: Date;
}