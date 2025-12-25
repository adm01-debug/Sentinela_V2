import { Scheduler } from '../../core/scheduler';
describe('Scheduler', () => {
  it('should schedule and cancel tasks', async () => {
    const scheduler = new Scheduler();
    let count = 0;
    scheduler.schedule({ name: 'test', interval: 50, handler: async () => { count++; } });
    await new Promise(r => setTimeout(r, 120));
    scheduler.cancel('test');
    expect(count).toBeGreaterThanOrEqual(2);
  });
});
