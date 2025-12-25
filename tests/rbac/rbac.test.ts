import { RoleManager, Authorizer } from '../../rbac';
describe('RBAC', () => {
  let roleManager: RoleManager;
  let authorizer: Authorizer;
  beforeEach(() => { roleManager = new RoleManager(); authorizer = new Authorizer(roleManager); });
  it('should assign and check permissions', async () => {
    await roleManager.createRole('admin', ['read', 'write', 'delete']);
    await roleManager.assignRole('user-1', 'admin');
    expect(await authorizer.can('user-1', 'read')).toBe(true);
    expect(await authorizer.can('user-1', 'admin')).toBe(false);
  });
  it('should support role inheritance', async () => {
    await roleManager.createRole('viewer', ['read']);
    await roleManager.createRole('editor', ['write'], ['viewer']);
    await roleManager.assignRole('user-1', 'editor');
    expect(await authorizer.can('user-1', 'read')).toBe(true);
    expect(await authorizer.can('user-1', 'write')).toBe(true);
  });
});
