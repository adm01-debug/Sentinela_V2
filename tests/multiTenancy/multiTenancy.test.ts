import { TenantManager, TenantContext, TenantIsolation } from '../../multiTenancy';

describe('TenantManager', () => {
  let manager: TenantManager;

  beforeEach(() => {
    manager = new TenantManager();
  });

  it('should create tenant', async () => {
    const tenant = await manager.createTenant({
      name: 'Acme Corp',
      plan: 'enterprise',
      config: { maxUsers: 100 }
    });

    expect(tenant.id).toBeDefined();
    expect(tenant.name).toBe('Acme Corp');
  });

  it('should get tenant by id', async () => {
    const created = await manager.createTenant({ name: 'Test Tenant', plan: 'basic' });
    const tenant = await manager.getTenant(created.id);

    expect(tenant).toBeDefined();
    expect(tenant.name).toBe('Test Tenant');
  });

  it('should update tenant config', async () => {
    const tenant = await manager.createTenant({ name: 'Update Test', plan: 'pro' });
    await manager.updateConfig(tenant.id, { maxUsers: 50 });

    const updated = await manager.getTenant(tenant.id);
    expect(updated.config.maxUsers).toBe(50);
  });

  it('should deactivate tenant', async () => {
    const tenant = await manager.createTenant({ name: 'Deactivate Test', plan: 'basic' });
    await manager.deactivate(tenant.id);

    const deactivated = await manager.getTenant(tenant.id);
    expect(deactivated.active).toBe(false);
  });
});

describe('TenantContext', () => {
  it('should set and get current tenant', () => {
    TenantContext.setCurrent('tenant-123');
    expect(TenantContext.getCurrent()).toBe('tenant-123');
  });

  it('should run in tenant context', async () => {
    const result = await TenantContext.run('tenant-456', async () => {
      return TenantContext.getCurrent();
    });

    expect(result).toBe('tenant-456');
  });
});

describe('TenantIsolation', () => {
  let isolation: TenantIsolation;

  beforeEach(() => {
    isolation = new TenantIsolation();
  });

  it('should scope data to tenant', async () => {
    await isolation.set('tenant-1', 'key', 'value-1');
    await isolation.set('tenant-2', 'key', 'value-2');

    const value1 = await isolation.get('tenant-1', 'key');
    const value2 = await isolation.get('tenant-2', 'key');

    expect(value1).toBe('value-1');
    expect(value2).toBe('value-2');
  });
});
