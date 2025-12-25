import { StatefulSetManager, StatefulSet, VolumeClaimTemplate } from '../../statefulSets';
describe('StatefulSetManager', () => {
  let manager: StatefulSetManager;
  beforeEach(() => { manager = new StatefulSetManager(); });
  it('should create statefulset', async () => {
    const ss = await manager.create({
      name: 'mongodb',
      replicas: 3,
      serviceName: 'mongodb',
      template: { containers: [{ name: 'mongo', image: 'mongo:5' }] }
    });
    expect(ss.name).toBe('mongodb');
  });
  it('should scale replicas', async () => {
    await manager.create({ name: 'db', replicas: 2, serviceName: 'db' });
    await manager.scale('db', 5);
    const ss = await manager.get('db');
    expect(ss.replicas).toBe(5);
  });
  it('should get pod ordinal', () => {
    const ordinal = manager.getPodOrdinal('mongodb-2');
    expect(ordinal).toBe(2);
  });
});