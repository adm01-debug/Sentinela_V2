import { DaemonSetManager, DaemonSet, NodeSelector } from '../../daemonSets';
describe('DaemonSetManager', () => {
  let manager: DaemonSetManager;
  beforeEach(() => { manager = new DaemonSetManager(); });
  it('should create daemonset', async () => {
    const ds = await manager.create({
      name: 'log-collector',
      template: { containers: [{ name: 'fluentd', image: 'fluentd:latest' }] }
    });
    expect(ds.name).toBe('log-collector');
  });
  it('should apply node selector', async () => {
    const ds = await manager.create({
      name: 'gpu-monitor',
      nodeSelector: { 'gpu': 'true' }
    });
    expect(ds.nodeSelector.gpu).toBe('true');
  });
  it('should get status', async () => {
    await manager.create({ name: 'status-test' });
    const status = await manager.getStatus('status-test');
    expect(status.desiredNumberScheduled).toBeDefined();
  });
});