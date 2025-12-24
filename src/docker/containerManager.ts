export interface Container { id: string; name: string; image: string; status: 'running' | 'stopped' | 'paused'; ports: string[]; createdAt: Date; }
export class ContainerManager {
  private containers = new Map<string, Container>();
  async start(name: string, image: string): Promise<Container> { const container: Container = { id: crypto.randomUUID(), name, image, status: 'running', ports: [], createdAt: new Date() }; this.containers.set(container.id, container); return container; }
  async stop(id: string): Promise<void> { const container = this.containers.get(id); if (container) container.status = 'stopped'; }
  async remove(id: string): Promise<void> { this.containers.delete(id); }
  list(): Container[] { return Array.from(this.containers.values()); }
  getRunning(): Container[] { return this.list().filter(c => c.status === 'running'); }
}
export const containerManager = new ContainerManager();
