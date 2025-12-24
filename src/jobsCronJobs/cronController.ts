import { CronJob, Job } from './types';
import { JobController } from './jobController';

export class CronJobController {
  private cronJobs: Map<string, CronJob> = new Map();
  private activeJobs: Map<string, string[]> = new Map();
  
  constructor(private jobController: JobController) {}
  
  create(cronJob: CronJob): void { this.cronJobs.set(this.key(cronJob), cronJob); }
  
  trigger(namespace: string, name: string): Job | undefined {
    const cronJob = this.cronJobs.get(namespace + '/' + name);
    if (!cronJob || cronJob.suspend) return undefined;
    
    const activeJobs = this.activeJobs.get(this.key(cronJob)) ?? [];
    if (cronJob.concurrencyPolicy === 'Forbid' && activeJobs.length > 0) return undefined;
    
    const job: Job = { ...cronJob.jobTemplate, name: cronJob.name + '-' + Date.now() };
    this.jobController.create(job);
    activeJobs.push(job.name);
    this.activeJobs.set(this.key(cronJob), activeJobs);
    
    return job;
  }
  
  suspend(namespace: string, name: string): void {
    const cronJob = this.cronJobs.get(namespace + '/' + name);
    if (cronJob) cronJob.suspend = true;
  }
  
  private key(cronJob: CronJob): string { return cronJob.namespace + '/' + cronJob.name; }
}