export interface StoredEvent {
  eventId: string;
  streamId: string;
  eventType: string;
  data: unknown;
  metadata: EventMetadata;
  version: number;
  timestamp: Date;
}

export interface EventMetadata {
  correlationId: string;
  causationId?: string;
  userId?: string;
  timestamp: Date;
}

export interface StreamInfo {
  streamId: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Projection<S = unknown> {
  name: string;
  initialState: S;
  handlers: Record<string, (state: S, event: StoredEvent) => S>;
}