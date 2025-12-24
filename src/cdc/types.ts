export interface CDCConfig {
  source: SourceConfig;
  sink: SinkConfig;
  transforms?: TransformConfig[];
}

export interface SourceConfig {
  type: 'postgres' | 'mysql' | 'mongodb';
  connectionString: string;
  tables: string[];
  slotName?: string;
}

export interface SinkConfig {
  type: 'kafka' | 'rabbitmq' | 'http';
  endpoint: string;
  topicPrefix?: string;
}

export interface TransformConfig {
  type: 'filter' | 'rename' | 'mask';
  config: Record<string, unknown>;
}

export interface ChangeEvent {
  id: string;
  table: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  timestamp: Date;
  transaction?: string;
}