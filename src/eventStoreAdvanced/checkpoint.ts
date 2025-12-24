export interface Checkpoint {
  subscriptionId: string;
  position: number;
  updatedAt: Date;
}

export class CheckpointStore {
  private checkpoints: Map<string, Checkpoint> = new Map();
  
  async save(subscriptionId: string, position: number): Promise<void> {
    this.checkpoints.set(subscriptionId, { subscriptionId, position, updatedAt: new Date() });
  }
  
  async get(subscriptionId: string): Promise<Checkpoint | null> { return this.checkpoints.get(subscriptionId) ?? null; }
  async delete(subscriptionId: string): Promise<void> { this.checkpoints.delete(subscriptionId); }
  async getAll(): Promise<Checkpoint[]> { return Array.from(this.checkpoints.values()); }
}

export class CheckpointManager {
  constructor(private store: CheckpointStore, private interval: number = 1000) {}
  private timers: Map<string, NodeJS.Timeout> = new Map();
  
  startTracking(subscriptionId: string, getPosition: () => number): void {
    const timer = setInterval(async () => { await this.store.save(subscriptionId, getPosition()); }, this.interval);
    this.timers.set(subscriptionId, timer);
  }
  
  stopTracking(subscriptionId: string): void {
    const timer = this.timers.get(subscriptionId);
    if (timer) { clearInterval(timer); this.timers.delete(subscriptionId); }
  }
  
  async getLastPosition(subscriptionId: string): Promise<number> {
    const checkpoint = await this.store.get(subscriptionId);
    return checkpoint?.position ?? 0;
  }
}