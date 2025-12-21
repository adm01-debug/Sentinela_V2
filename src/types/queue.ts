export interface QueueJob {
  id: string;
  queue: string;
  payload: Record<string, unknown>;
  priority: number;
  attempts: number;
  maxAttempts: number;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  createdAt: string;
  processedAt?: string;
}