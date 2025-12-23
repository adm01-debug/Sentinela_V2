interface ReportJob { id: string; type: string; params: any; status: 'pending' | 'processing' | 'completed' | 'failed'; result?: any; error?: string; }
class ReportQueue {
  private jobs: ReportJob[] = [];
  add(type: string, params: any): string { const id = Date.now().toString(36); this.jobs.push({ id, type, params, status: 'pending' }); return id; }
  async process(handler: (type: string, params: any) => Promise<any>) { const job = this.jobs.find(j => j.status === 'pending'); if (!job) return; job.status = 'processing'; try { job.result = await handler(job.type, job.params); job.status = 'completed'; } catch (e: any) { job.error = e.message; job.status = 'failed'; } }
  getStatus(id: string) { return this.jobs.find(j => j.id === id); }
  get pending() { return this.jobs.filter(j => j.status === 'pending').length; }
}
export const reportQueue = new ReportQueue();
