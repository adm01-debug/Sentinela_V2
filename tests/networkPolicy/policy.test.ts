import { NetworkPolicyManager } from '../../networkPolicy';
describe('NetworkPolicyManager', () => {
  let manager: NetworkPolicyManager;
  beforeEach(() => { manager = new NetworkPolicyManager(); });
  it('should check if traffic allowed', () => {
    manager.create({ name: 'api-policy', ingress: ['frontend'], egress: ['database', 'cache'] });
    expect(manager.isAllowed('api-policy', 'frontend', 'database')).toBe(true);
  });
});
