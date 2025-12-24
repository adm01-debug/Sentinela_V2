export interface ChangeEvent {
  id: string;
  source: string;
  table: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  timestamp: Date;
  transactionId?: string;
}

export interface CDCConfig { source: string; tables: string[]; batchSize: number; pollInterval: number; }