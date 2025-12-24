import { Job, JobStatus } from './types';
import { v4 as uuidv4 } from 'uuid';

export class JobController {
  private jobs: Map<string, Job> = new Map();
  
  create(job: Job): Job {
    job.status = { active: 0, succeeded: 0, failed: 0, startTime: new Date() };
    this.jobs.set(this.key(job), job);
    this.runJob(job);
    return job;
  }
  
  private async runJob(job: Job): Promise<void> {
    const pods: { id: string; status: 'running' | 'succeeded' | 'failed' }[] = [];
    
    for (let i = 0; i < job.spec.completions; i++) {
      if (pods.filter(p => p.status === 'running').length < job.spec.parallelism) {
        const pod = { id: uuidv4(), status: 'running' as const };
        pods.push(pod);
        job.status!.active++;
        
        setTimeout(() => {
          pod.status = Math.random() > 0.1 ? 'succeeded' : 'failed';
          job.status!.active--;
          if (pod.status === 'succeeded') job.status!.succeeded++;
          else job.status!.failed++;
          
          if (job.status!.succeeded >= job.spec.completions) job.status!.completionTime = new Date();
        }, 50);
      }
    }
  }
  
  private key(job: Job): string { return job.namespace + '/' + job.name; }
  get(namespace: string, name: string): Job | undefined { return this.jobs.get(namespace + '/' + name); }
  list(namespace?: string): Job[] { const all = Array.from(this.jobs.values()); return namespace ? all.filter(j => j.namespace === namespace) : all; }
}