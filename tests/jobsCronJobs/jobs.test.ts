import { JobScheduler } from '../../jobsCronJobs';
describe('JobScheduler', () => {
  it('should schedule job', async () => {
    const scheduler = new JobScheduler();
    const job = await scheduler.schedule({ name: 'backup', schedule: '0 0 * * *', image: 'backup:latest' });
    expect(job.schedule).toBe('0 0 * * *');
  });
});
