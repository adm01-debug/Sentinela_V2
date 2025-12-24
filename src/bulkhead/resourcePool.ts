// Resource Pool
export class ResourcePool<T> {
  private available: T[] = []; private inUse: Set<T> = new Set();
  constructor(private factory: () => T, private maxSize: number) { for (let i = 0; i < maxSize; i++) this.available.push(factory()); }
  async acquire(): Promise<T> {
    if (this.available.length === 0) throw new Error("No resources available");
    const resource = this.available.pop()!; this.inUse.add(resource); return resource;
  }
  release(resource: T): void { this.inUse.delete(resource); this.available.push(resource); }
  getStats() { return { available: this.available.length, inUse: this.inUse.size }; }
}
