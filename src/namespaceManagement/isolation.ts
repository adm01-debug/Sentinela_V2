export class NamespaceIsolation {
  private isolatedNamespaces: Set<string> = new Set();
  private allowedCommunication: Map<string, string[]> = new Map();
  
  isolate(namespace: string): void { this.isolatedNamespaces.add(namespace); }
  unisolate(namespace: string): void { this.isolatedNamespaces.delete(namespace); }
  
  allowCommunication(from: string, to: string): void {
    const allowed = this.allowedCommunication.get(from) ?? [];
    if (!allowed.includes(to)) allowed.push(to);
    this.allowedCommunication.set(from, allowed);
  }
  
  canCommunicate(from: string, to: string): boolean {
    if (!this.isolatedNamespaces.has(from) && !this.isolatedNamespaces.has(to)) return true;
    const allowed = this.allowedCommunication.get(from) ?? [];
    return allowed.includes(to);
  }
  
  getIsolatedNamespaces(): string[] { return Array.from(this.isolatedNamespaces); }
}