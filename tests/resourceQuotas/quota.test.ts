import { ResourceQuotaManager } from '../../resourceQuotas';
describe('ResourceQuotaManager', () => {
  let manager: ResourceQuotaManager;
  beforeEach(() => { manager = new ResourceQuotaManager(); });
  it('should set and get quotas', async () => {
    await manager.set({ namespace: 'prod', cpu: '100', memory: '200Gi', pods: '50' });
    const quota = await manager.get('prod');
    expect(quota?.cpu).toBe('100');
  });
});
