interface EmailJob { id: string; to: string; subject: string; body: string; status: 'pending' | 'sent' | 'failed'; attempts: number; }
class EmailQueue {
  private queue: EmailJob[] = [];
  private maxRetries = 3;
  add(to: string, subject: string, body: string) { this.queue.push({ id: Date.now().toString(36), to, subject, body, status: 'pending', attempts: 0 }); }
  async process(sender: (email: EmailJob) => Promise<void>) { const job = this.queue.find(j => j.status === 'pending'); if (!job) return; job.attempts++; try { await sender(job); job.status = 'sent'; } catch { if (job.attempts >= this.maxRetries) job.status = 'failed'; } }
  get pending() { return this.queue.filter(j => j.status === 'pending').length; }
  get failed() { return this.queue.filter(j => j.status === 'failed'); }
}
export const emailQueue = new EmailQueue();
