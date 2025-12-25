import { DaemonSetManager } from '../../daemonSets';
describe('DaemonSetManager', () => {
  it('should create daemonset', async () => {
    const manager = new DaemonSetManager();
    const ds = await manager.create({ name: 'log-collector', image: 'fluent/fluentd' });
    expect(ds.name).toBe('log-collector');
  });
});
