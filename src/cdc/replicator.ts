// Data Replicator
export class DataReplicator {
  private targets: Map<string, (data: unknown) => Promise<void>> = new Map();
  addTarget(name: string, handler: (data: unknown) => Promise<void>): void { this.targets.set(name, handler); }
  removeTarget(name: string): void { this.targets.delete(name); }
  async replicate(data: unknown): Promise<void> { await Promise.all(Array.from(this.targets.values()).map(h => h(data))); }
  getTargets(): string[] { return Array.from(this.targets.keys()); }
}
