import { JobScheduler, Job, CronJob } from '../../jobsCronJobs';
describe('JobScheduler', () => {
  let scheduler: JobScheduler;
  beforeEach(() => { scheduler = new JobScheduler(); });
  afterEach(() => { scheduler.stop(); });
  it('should create job', async () => {
    const job = await scheduler.createJob({ name: 'backup', image: 'backup:v1', command: ['./backup.sh'] });
    expect(job.status).toBe('pending');
  });
  it('should run job to completion', async () => {
    const job = await scheduler.createJob({ name: 'task', image: 'task:v1', command: ['./run.sh'] });
    await scheduler.waitForCompletion(job.id);
    const status = await scheduler.getStatus(job.id);
    expect(status.completions).toBe(1);
  });
  it('should create cronjob', async () => {
    const cron = await scheduler.createCronJob({
      name: 'hourly-cleanup', schedule: '0 * * * *', image: 'cleanup:v1'
    });
    expect(cron.schedule).toBe('0 * * * *');
  });
  it('should get job history', async () => {
    await scheduler.createCronJob({ name: 'daily', schedule: '0 0 * * *', image: 'daily:v1' });
    await scheduler.triggerCronJob('daily');
    await scheduler.triggerCronJob('daily');
    const history = await scheduler.getJobHistory('daily');
    expect(history.length).toBe(2);
  });
});