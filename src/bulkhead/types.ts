export interface BulkheadConfig {
  name: string;
  maxConcurrent: number;
  maxWait: number;
  timeout: number;
}

export interface BulkheadStats {
  name: string;
  active: number;
  waiting: number;
  available: number;
  rejections: number;
  timeouts: number;
}

export enum BulkheadState { Open = 'open', Full = 'full', Closed = 'closed' }