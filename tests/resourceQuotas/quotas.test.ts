import { ResourceQuotaManager, ResourceQuota, ResourceList } from '../../resourceQuotas';
describe('ResourceQuotaManager', () => {
  let manager: ResourceQuotaManager;
  beforeEach(() => { manager = new ResourceQuotaManager(); });
  it('should create quota', async () => {
    const quota = await manager.create({
      name: 'team-a-quota',
      namespace: 'team-a',
      hard: { cpu: '10', memory: '20Gi', pods: '50' }
    });
    expect(quota.hard.cpu).toBe('10');
  });
  it('should get usage', async () => {
    await manager.create({ name: 'usage-test', hard: { cpu: '10' } });
    const usage = await manager.getUsage('usage-test');
    expect(usage.used).toBeDefined();
    expect(usage.hard).toBeDefined();
  });
  it('should check if request fits', async () => {
    await manager.create({ name: 'fit-test', hard: { cpu: '10' } });
    const fits = await manager.checkFits('fit-test', { cpu: '2' });
    expect(fits).toBe(true);
  });
});