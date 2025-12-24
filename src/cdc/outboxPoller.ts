// Outbox Poller
export interface OutboxEntry { id: string; aggregateType: string; aggregateId: string; eventType: string; payload: unknown; createdAt: Date; processedAt?: Date; }
export class OutboxPoller {
  private entries: OutboxEntry[] = []; private running = false;
  async poll(limit: number = 100): Promise<OutboxEntry[]> { return this.entries.filter(e => !e.processedAt).slice(0, limit); }
  async markProcessed(ids: string[]): Promise<void> { for (const entry of this.entries) { if (ids.includes(entry.id)) entry.processedAt = new Date(); } }
  async add(entry: Omit<OutboxEntry, "id" | "createdAt">): Promise<void> { this.entries.push({ ...entry, id: crypto.randomUUID(), createdAt: new Date() }); }
  start(intervalMs: number = 1000): void { this.running = true; }
  stop(): void { this.running = false; }
}
