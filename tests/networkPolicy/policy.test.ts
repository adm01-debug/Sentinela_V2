import { NetworkPolicyManager } from '../../networkPolicy';

describe('NetworkPolicyManager', () => {
  it('should create policy', async () => {
    const manager = new NetworkPolicyManager();
    const policy = await manager.create({ name: 'deny-all', namespace: 'default' });
    expect(policy.name).toBe('deny-all');
  });
});
