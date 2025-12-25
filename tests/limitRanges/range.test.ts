import { LimitRangeManager } from '../../limitRanges';

describe('LimitRangeManager', () => {
  it('should set limits', async () => {
    const manager = new LimitRangeManager();
    await manager.set({ namespace: 'dev', defaultCPU: '100m', defaultMemory: '128Mi' });
    const limits = await manager.get('dev');
    expect(limits).toBeDefined();
  });
});
