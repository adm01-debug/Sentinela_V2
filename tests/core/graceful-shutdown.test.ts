import { GracefulShutdown } from '../../core/graceful-shutdown';
describe('GracefulShutdown', () => {
  it('should run handlers in reverse order', async () => {
    const order: number[] = [];
    const shutdown = new GracefulShutdown();
    shutdown.register(async () => { order.push(1); });
    shutdown.register(async () => { order.push(2); });
    await shutdown.shutdown();
    expect(order).toEqual([2, 1]);
  });
});
