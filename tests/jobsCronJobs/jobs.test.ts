import { JobManager, CronJobManager, Job, CronJob } from '../../jobsCronJobs';
describe('JobManager', () => {
  let manager: JobManager;
  beforeEach(() => { manager = new JobManager(); });
  it('should create job', async () => {
    const job = await manager.create({
      name: 'data-migration',
      template: { containers: [{ name: 'migrate', image: 'migrate:v1' }] }
    });
    expect(job.name).toBe('data-migration');
  });
  it('should get job status', async () => {
    await manager.create({ name: 'check-job' });
    const status = await manager.getStatus('check-job');
    expect(['Running', 'Succeeded', 'Failed', 'Pending']).toContain(status.state);
  });
  it('should delete completed jobs', async () => {
    await manager.deleteCompleted();
  });
});
describe('CronJobManager', () => {
  let manager: CronJobManager;
  beforeEach(() => { manager = new CronJobManager(); });
  it('should create cronjob', async () => {
    const cj = await manager.create({
      name: 'backup',
      schedule: '0 2 * * *',
      jobTemplate: { containers: [{ name: 'backup', image: 'backup:v1' }] }
    });
    expect(cj.schedule).toBe('0 2 * * *');
  });
  it('should suspend cronjob', async () => {
    await manager.create({ name: 'suspend-test', schedule: '* * * * *' });
    await manager.suspend('suspend-test');
    const cj = await manager.get('suspend-test');
    expect(cj.suspend).toBe(true);
  });
});