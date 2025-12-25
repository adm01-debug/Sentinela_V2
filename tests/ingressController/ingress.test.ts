import { IngressManager } from '../../ingressController';
describe('IngressManager', () => {
  let manager: IngressManager;
  beforeEach(() => { manager = new IngressManager(); });
  it('should route requests', async () => {
    await manager.updateRules('api', [{ path: '/api', service: 'api-svc' }, { path: '/web', service: 'web-svc' }]);
    expect(await manager.route('/api/users')).toBe('api-svc');
    expect(await manager.route('/web/home')).toBe('web-svc');
  });
});
