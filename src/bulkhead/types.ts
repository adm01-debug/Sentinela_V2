export interface BulkheadConfig {
  name: string;
  maxConcurrent: number;
  maxWait: number;
  timeout: number;
}

export interface BulkheadStats {
  name: string;
  activeCount: number;
  waitingCount: number;
  availableSlots: number;
  totalExecutions: number;
  rejections: number;
}