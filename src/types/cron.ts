export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  handler: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
}

export interface CronResult {
  jobId: string;
  status: 'success' | 'failure';
  duration: number;
  output?: string;
  error?: string;
}