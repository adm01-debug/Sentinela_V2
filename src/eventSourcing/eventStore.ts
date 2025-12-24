// Event Store
export interface StoredEvent { id: string; streamId: string; type: string; data: unknown; metadata: Record<string, unknown>; version: number; timestamp: Date; }
export class EventStore {
  private streams: Map<string, StoredEvent[]> = new Map();
  async append(streamId: string, events: Omit<StoredEvent, "id" | "version" | "timestamp">[]): Promise<void> {
    if (!this.streams.has(streamId)) this.streams.set(streamId, []);
    const stream = this.streams.get(streamId)!;
    for (const event of events) {
      stream.push({ ...event, id: crypto.randomUUID(), version: stream.length + 1, timestamp: new Date() });
    }
  }
  async read(streamId: string, fromVersion?: number): Promise<StoredEvent[]> {
    const stream = this.streams.get(streamId) || [];
    return fromVersion ? stream.filter(e => e.version >= fromVersion) : stream;
  }
  async readAll(): Promise<StoredEvent[]> { return Array.from(this.streams.values()).flat().sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()); }
}
