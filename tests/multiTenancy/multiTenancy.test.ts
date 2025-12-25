import { TenantManager } from '../../multiTenancy';

describe('TenantManager', () => {
  let manager: TenantManager;
  beforeEach(() => { manager = new TenantManager(); });

  it('should create tenant', async () => {
    const tenant = await manager.create({ name: 'Acme Corp', plan: 'enterprise' });
    expect(tenant.id).toBeDefined();
  });

  it('should isolate tenant data', async () => {
    const t1 = await manager.create({ name: 'Tenant 1', plan: 'basic' });
    const t2 = await manager.create({ name: 'Tenant 2', plan: 'basic' });
    const data1 = await manager.getDataForTenant(t1.id);
    const data2 = await manager.getDataForTenant(t2.id);
    expect(data1).not.toBe(data2);
  });
});
