import { TenantManager, TenantIsolation, TenantBilling } from '../../src/multiTenancy';

describe('TenantManager', () => {
  let manager: TenantManager;

  beforeEach(() => {
    manager = new TenantManager();
  });

  it('should create tenant', () => {
    const tenant = manager.create('Acme Corp', {
      maxNamespaces: 5,
      maxCpu: '10',
      maxMemory: '20Gi',
      maxStorage: '100Gi'
    });

    expect(tenant.id).toBeDefined();
    expect(tenant.name).toBe('Acme Corp');
    expect(tenant.status).toBe('active');
  });

  it('should add namespace to tenant', () => {
    const tenant = manager.create('Test', {
      maxNamespaces: 2,
      maxCpu: '1',
      maxMemory: '1Gi',
      maxStorage: '10Gi'
    });

    const added = manager.addNamespace(tenant.id, 'namespace-1');
    expect(added).toBe(true);
    
    const updated = manager.get(tenant.id);
    expect(updated?.namespaces).toContain('namespace-1');
  });

  it('should not exceed namespace quota', () => {
    const tenant = manager.create('Test', {
      maxNamespaces: 1,
      maxCpu: '1',
      maxMemory: '1Gi',
      maxStorage: '10Gi'
    });

    manager.addNamespace(tenant.id, 'ns-1');
    const added = manager.addNamespace(tenant.id, 'ns-2');
    
    expect(added).toBe(false);
  });

  it('should suspend and activate tenant', () => {
    const tenant = manager.create('Test', {
      maxNamespaces: 1,
      maxCpu: '1',
      maxMemory: '1Gi',
      maxStorage: '10Gi'
    });

    manager.suspend(tenant.id);
    expect(manager.get(tenant.id)?.status).toBe('suspended');

    manager.activate(tenant.id);
    expect(manager.get(tenant.id)?.status).toBe('active');
  });
});

describe('TenantIsolation', () => {
  let isolation: TenantIsolation;

  beforeEach(() => {
    isolation = new TenantIsolation();
  });

  it('should register namespace to tenant', () => {
    isolation.registerNamespace('ns-1', 'tenant-1');
    expect(isolation.getTenantForNamespace('ns-1')).toBe('tenant-1');
  });

  it('should validate access', () => {
    isolation.registerNamespace('ns-1', 'tenant-1');
    
    expect(isolation.canAccess('tenant-1', 'ns-1')).toBe(true);
    expect(isolation.canAccess('tenant-2', 'ns-1')).toBe(false);
  });
});
