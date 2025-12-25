import { StatefulSetManager } from '../../statefulSets';
describe('StatefulSetManager', () => {
  it('should create statefulset', async () => {
    const manager = new StatefulSetManager();
    const sts = await manager.create({ name: 'db', replicas: 3, volumeClaim: { size: '10Gi' } });
    expect(sts.replicas).toBe(3);
  });
});
