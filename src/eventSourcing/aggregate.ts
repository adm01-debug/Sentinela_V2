// Event Sourced Aggregate
import { StoredEvent } from "./eventStore";
export abstract class EventSourcedAggregate {
  protected version = 0; private changes: Omit<StoredEvent, "id" | "version" | "timestamp">[] = [];
  constructor(protected readonly id: string) {}
  protected apply(type: string, data: unknown): void { this.changes.push({ streamId: this.id, type, data, metadata: {} }); this.when({ type, data } as StoredEvent); }
  abstract when(event: StoredEvent): void;
  loadFromHistory(events: StoredEvent[]): void { for (const event of events) { this.when(event); this.version = event.version; } }
  getUncommittedChanges(): Omit<StoredEvent, "id" | "version" | "timestamp">[] { return [...this.changes]; }
  clearChanges(): void { this.changes = []; }
}
