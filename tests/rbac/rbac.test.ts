import { RBACAuthorizer, RoleManager, Permission, Role } from '../../rbac';

describe('RoleManager', () => {
  let roleManager: RoleManager;

  beforeEach(() => {
    roleManager = new RoleManager();
  });

  it('should create role with permissions', () => {
    const role = roleManager.createRole('admin', [
      { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'orders', actions: ['read', 'update'] }
    ]);

    expect(role.name).toBe('admin');
    expect(role.permissions.length).toBe(2);
  });

  it('should add permission to role', () => {
    roleManager.createRole('editor', []);
    roleManager.addPermission('editor', { resource: 'posts', actions: ['create', 'update'] });

    const role = roleManager.getRole('editor');
    expect(role?.permissions.length).toBe(1);
  });

  it('should remove permission from role', () => {
    roleManager.createRole('viewer', [
      { resource: 'posts', actions: ['read'] },
      { resource: 'comments', actions: ['read'] }
    ]);

    roleManager.removePermission('viewer', 'comments');
    const role = roleManager.getRole('viewer');

    expect(role?.permissions.length).toBe(1);
  });
});

describe('RBACAuthorizer', () => {
  let authorizer: RBACAuthorizer;

  beforeEach(() => {
    const roleManager = new RoleManager();
    roleManager.createRole('admin', [
      { resource: '*', actions: ['*'] }
    ]);
    roleManager.createRole('user', [
      { resource: 'profile', actions: ['read', 'update'] },
      { resource: 'orders', actions: ['read', 'create'] }
    ]);

    authorizer = new RBACAuthorizer(roleManager);
  });

  it('should authorize admin for any action', () => {
    expect(authorizer.authorize('admin', 'users', 'delete')).toBe(true);
    expect(authorizer.authorize('admin', 'anything', 'any-action')).toBe(true);
  });

  it('should authorize user for allowed actions', () => {
    expect(authorizer.authorize('user', 'profile', 'read')).toBe(true);
    expect(authorizer.authorize('user', 'orders', 'create')).toBe(true);
  });

  it('should deny user for disallowed actions', () => {
    expect(authorizer.authorize('user', 'users', 'delete')).toBe(false);
    expect(authorizer.authorize('user', 'profile', 'delete')).toBe(false);
  });

  it('should deny unknown roles', () => {
    expect(authorizer.authorize('unknown', 'profile', 'read')).toBe(false);
  });
});
