import { NodeAffinityManager } from '../../nodeAffinity';
describe('NodeAffinityManager', () => {
  it('should set node affinity', async () => {
    const manager = new NodeAffinityManager();
    const affinity = await manager.set({ required: [{ key: 'zone', values: ['us-east-1a'] }] });
    expect(affinity).toBeDefined();
  });
});
