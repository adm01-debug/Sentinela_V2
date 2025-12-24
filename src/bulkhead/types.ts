export interface BulkheadConfig {
  name: string;
  maxConcurrent: number;
  maxWait: number;
  timeout: number;
}

export interface BulkheadMetrics {
  activeCount: number;
  queuedCount: number;
  completedCount: number;
  rejectedCount: number;
  averageWaitTime: number;
}