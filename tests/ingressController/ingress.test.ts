import { IngressManager } from '../../ingressController';
describe('IngressManager', () => {
  it('should update rules', async () => {
    const mgr = new IngressManager();
    await mgr.updateRules('api-ingress', [{ path: '/api', service: 'api-svc' }]);
    const rules = await mgr.getRules('api-ingress');
    expect(rules.length).toBe(1);
  });
});
