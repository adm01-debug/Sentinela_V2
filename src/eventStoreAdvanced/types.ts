export interface EventData {
  eventId: string;
  eventType: string;
  data: unknown;
  metadata?: Record<string, unknown>;
}

export interface RecordedEvent extends EventData {
  streamId: string;
  streamPosition: number;
  globalPosition: number;
  created: Date;
}

export interface StreamMetadata {
  maxCount?: number;
  maxAge?: number;
  truncateBefore?: number;
  acl?: StreamACL;
}

export interface StreamACL {
  readRoles: string[];
  writeRoles: string[];
  deleteRoles: string[];
  metaReadRoles: string[];
  metaWriteRoles: string[];
}

export interface AppendResult {
  nextExpectedStreamPosition: number;
  logPosition: number;
}