import { RoleManager, Authorizer } from '../../rbac';

describe('RoleManager', () => {
  let manager: RoleManager;
  beforeEach(() => { manager = new RoleManager(); });

  it('should create role', async () => {
    await manager.createRole('admin', ['read', 'write', 'delete']);
    const role = await manager.getRole('admin');
    expect(role.permissions).toContain('read');
  });

  it('should assign role to user', async () => {
    await manager.createRole('editor', ['read', 'write']);
    await manager.assignRole('user-1', 'editor');
    const roles = await manager.getUserRoles('user-1');
    expect(roles).toContain('editor');
  });
});

describe('Authorizer', () => {
  it('should authorize based on permissions', async () => {
    const manager = new RoleManager();
    await manager.createRole('viewer', ['read']);
    await manager.assignRole('user-1', 'viewer');
    const authorizer = new Authorizer(manager);
    expect(await authorizer.can('user-1', 'read')).toBe(true);
    expect(await authorizer.can('user-1', 'write')).toBe(false);
  });
});
