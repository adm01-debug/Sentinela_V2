export interface StoredEvent {
  eventId: string;
  streamId: string;
  eventType: string;
  data: unknown;
  metadata: EventMetadata;
  version: number;
  timestamp: Date;
}

export interface EventMetadata { correlationId: string; causationId?: string; userId?: string; }
export interface EventStream { streamId: string; events: StoredEvent[]; version: number; }
export interface Projection<S> { name: string; initialState: S; handlers: Record<string, (state: S, event: StoredEvent) => S>; }