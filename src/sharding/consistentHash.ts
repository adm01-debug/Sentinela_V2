export class ConsistentHash {
  private ring: Map<number, string> = new Map();
  private sortedKeys: number[] = [];
  
  constructor(private virtualNodes: number = 100) {}
  
  addNode(nodeId: string, weight: number = 1): void {
    const vnodes = this.virtualNodes * weight;
    for (let i = 0; i < vnodes; i++) {
      const hash = this.hash(nodeId + ':' + i);
      this.ring.set(hash, nodeId);
      this.sortedKeys.push(hash);
    }
    this.sortedKeys.sort((a, b) => a - b);
  }
  
  removeNode(nodeId: string): void {
    const toRemove: number[] = [];
    this.ring.forEach((node, hash) => { if (node === nodeId) toRemove.push(hash); });
    toRemove.forEach(hash => { this.ring.delete(hash); });
    this.sortedKeys = this.sortedKeys.filter(k => !toRemove.includes(k));
  }
  
  getNode(key: string): string {
    if (this.ring.size === 0) throw new Error('No nodes in ring');
    const hash = this.hash(key);
    for (const ringKey of this.sortedKeys) { if (ringKey >= hash) return this.ring.get(ringKey)!; }
    return this.ring.get(this.sortedKeys[0])!;
  }
  
  private hash(key: string): number {
    let hash = 0;
    for (let i = 0; i < key.length; i++) { hash = ((hash << 5) - hash) + key.charCodeAt(i); hash |= 0; }
    return Math.abs(hash);
  }
}