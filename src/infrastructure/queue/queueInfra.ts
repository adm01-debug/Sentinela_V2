type Job = { id: string; type: string; data: any; status: string; createdAt: Date };
export class QueueInfra {
  private jobs: Job[] = [];
  private handlers = new Map<string, (data: any) => Promise<void>>();
  register(type: string, handler: (data: any) => Promise<void>) { this.handlers.set(type, handler); }
  async add(type: string, data: any): Promise<string> { const id = crypto.randomUUID(); this.jobs.push({ id, type, data, status: 'pending', createdAt: new Date() }); return id; }
  async process(): Promise<void> { const pending = this.jobs.filter(j => j.status === 'pending'); for (const job of pending) { const handler = this.handlers.get(job.type); if (handler) { try { await handler(job.data); job.status = 'completed'; } catch { job.status = 'failed'; } } } }
}
export const queueInfra = new QueueInfra();
