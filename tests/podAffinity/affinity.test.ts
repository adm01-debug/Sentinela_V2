import { PodAffinityManager } from '../../podAffinity';
describe('PodAffinityManager', () => {
  it('should set pod affinity', async () => {
    const manager = new PodAffinityManager();
    const affinity = await manager.set({ podAffinity: { labelSelector: { app: 'web' } } });
    expect(affinity).toBeDefined();
  });
});
