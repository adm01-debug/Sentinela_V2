import { AdvancedNetworkPolicyManager } from '../../networkPoliciesAdvanced';
describe('AdvancedNetworkPolicyManager', () => {
  it('should create egress policy', async () => {
    const manager = new AdvancedNetworkPolicyManager();
    const policy = await manager.createEgress({ name: 'allow-dns', ports: [53] });
    expect(policy.type).toBe('egress');
  });
});
