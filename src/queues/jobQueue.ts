type Job<T = any> = { id: string; type: string; data: T; priority: number; createdAt: Date; attempts: number };
type JobHandler<T = any> = (data: T) => Promise<void>;
class JobQueue {
  private queue: Job[] = [];
  private handlers: Map<string, JobHandler> = new Map();
  private processing = false;
  private maxRetries = 3;
  register<T>(type: string, handler: JobHandler<T>) { this.handlers.set(type, handler); }
  add<T>(type: string, data: T, priority = 0) { this.queue.push({ id: Date.now().toString(36), type, data, priority, createdAt: new Date(), attempts: 0 }); this.queue.sort((a, b) => b.priority - a.priority); this.process(); }
  private async process() { if (this.processing || !this.queue.length) return; this.processing = true; const job = this.queue.shift()!; const handler = this.handlers.get(job.type); if (handler) { try { await handler(job.data); } catch (e) { if (job.attempts < this.maxRetries) { job.attempts++; this.queue.push(job); } } } this.processing = false; this.process(); }
  get pending() { return this.queue.length; }
}
export const jobQueue = new JobQueue();
