export interface ChangeEvent {
  id: string;
  timestamp: Date;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  source: SourceInfo;
}

export interface SourceInfo {
  connector: string;
  database: string;
  snapshot: boolean;
  position: string;
}

export interface CDCConfig {
  database: string;
  tables: string[];
  slotName: string;
  publicationName: string;
}