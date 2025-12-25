import { NetworkPolicyController, NetworkPolicy, Rule } from '../../networkPolicy';
describe('NetworkPolicyController', () => {
  let controller: NetworkPolicyController;
  beforeEach(() => { controller = new NetworkPolicyController(); });
  it('should create policy', async () => {
    const policy = await controller.create({
      name: 'deny-all', namespace: 'default',
      ingress: [], egress: []
    });
    expect(policy.id).toBeDefined();
  });
  it('should allow specific ingress', async () => {
    await controller.create({
      name: 'allow-web', namespace: 'default',
      ingress: [{ from: [{ podSelector: { app: 'frontend' } }], ports: [{ port: 80 }] }]
    });
    const allowed = await controller.isAllowed('default', 'frontend', 'backend', 80);
    expect(allowed).toBe(true);
  });
  it('should delete policy', async () => {
    const policy = await controller.create({ name: 'temp', namespace: 'default' });
    await controller.delete(policy.id);
    const found = await controller.get(policy.id);
    expect(found).toBeNull();
  });
});