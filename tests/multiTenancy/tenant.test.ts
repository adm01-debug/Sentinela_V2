import { TenantManager } from '../../multiTenancy';
describe('TenantManager', () => {
  let manager: TenantManager;
  beforeEach(() => { manager = new TenantManager(); });
  it('should manage tenants', () => {
    manager.create({ id: 't1', name: 'Acme Corp', config: { plan: 'enterprise' } });
    manager.create({ id: 't2', name: 'Startup Inc', config: { plan: 'starter' } });
    expect(manager.get('t1')?.name).toBe('Acme Corp');
    expect(manager.list().length).toBe(2);
  });
});
