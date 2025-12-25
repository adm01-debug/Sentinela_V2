import { NetworkPolicyManager, Policy, Rule } from '../../networkPolicy';
describe('NetworkPolicyManager', () => {
  let manager: NetworkPolicyManager;
  beforeEach(() => { manager = new NetworkPolicyManager(); });
  it('should create policy', async () => {
    const policy = await manager.create({
      name: 'deny-all',
      namespace: 'default',
      ingress: [],
      egress: []
    });
    expect(policy.id).toBeDefined();
  });
  it('should allow specific ingress', async () => {
    const policy = await manager.create({
      name: 'allow-web',
      ingress: [{ from: [{ podSelector: { app: 'frontend' } }], ports: [{ port: 80 }] }]
    });
    expect(policy.ingress.length).toBe(1);
  });
  it('should delete policy', async () => {
    await manager.create({ name: 'temp-policy' });
    await manager.delete('temp-policy');
    const policies = await manager.list();
    expect(policies.find(p => p.name === 'temp-policy')).toBeUndefined();
  });
});