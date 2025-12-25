import { StatefulSetController, StatefulSet, PersistentVolume } from '../../statefulSets';
describe('StatefulSetController', () => {
  let controller: StatefulSetController;
  beforeEach(() => { controller = new StatefulSetController(); });
  it('should create statefulset', async () => {
    const sts = await controller.create({
      name: 'postgres', replicas: 3,
      volumeClaimTemplate: { storageClass: 'ssd', size: '10Gi' }
    });
    expect(sts.name).toBe('postgres');
  });
  it('should scale orderly', async () => {
    await controller.create({ name: 'kafka', replicas: 1 });
    await controller.scale('kafka', 3);
    const pods = await controller.getPods('kafka');
    expect(pods.map(p => p.name)).toEqual(['kafka-0', 'kafka-1', 'kafka-2']);
  });
  it('should maintain identity', async () => {
    await controller.create({ name: 'zk', replicas: 3 });
    await controller.restartPod('zk-1');
    const pod = await controller.getPod('zk-1');
    expect(pod.name).toBe('zk-1');
  });
});