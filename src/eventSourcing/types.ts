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

export interface EventStream {
  streamId: string;
  events: StoredEvent[];
  version: number;
}

export interface Snapshot<T> {
  streamId: string;
  state: T;
  version: number;
  timestamp: Date;
}

export interface Projection {
  name: string;
  handle(event: StoredEvent): Promise<void>;
  reset(): Promise<void>;
}