import { DaemonSetController, DaemonSet, NodeSelector } from '../../daemonSets';
describe('DaemonSetController', () => {
  let controller: DaemonSetController;
  beforeEach(() => { controller = new DaemonSetController(); });
  it('should create daemonset', async () => {
    const ds = await controller.create({
      name: 'log-collector', image: 'fluentd:latest'
    });
    expect(ds.name).toBe('log-collector');
  });
  it('should run on all nodes', async () => {
    await controller.create({ name: 'node-exporter', image: 'prom/node-exporter' });
    const pods = await controller.getPods('node-exporter');
    const nodes = await controller.getNodes();
    expect(pods.length).toBe(nodes.length);
  });
  it('should respect node selector', async () => {
    await controller.create({
      name: 'gpu-monitor', image: 'nvidia/dcgm',
      nodeSelector: { 'gpu': 'true' }
    });
    const pods = await controller.getPods('gpu-monitor');
    pods.forEach(p => expect(p.nodeLabels['gpu']).toBe('true'));
  });
});