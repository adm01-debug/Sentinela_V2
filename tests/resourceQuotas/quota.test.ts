import { ResourceQuotaManager } from '../../resourceQuotas';

describe('ResourceQuotaManager', () => {
  it('should set quota', async () => {
    const manager = new ResourceQuotaManager();
    await manager.set({ namespace: 'dev', cpu: '10', memory: '20Gi' });
    const quota = await manager.get('dev');
    expect(quota.cpu).toBe('10');
  });
});
