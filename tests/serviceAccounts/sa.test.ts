import { ServiceAccountManager, ServiceAccount, TokenRequest } from '../../serviceAccounts';
describe('ServiceAccountManager', () => {
  let manager: ServiceAccountManager;
  beforeEach(() => { manager = new ServiceAccountManager(); });
  it('should create service account', async () => {
    const sa = await manager.create({
      name: 'app-sa',
      namespace: 'default'
    });
    expect(sa.name).toBe('app-sa');
  });
  it('should get token', async () => {
    await manager.create({ name: 'token-test' });
    const token = await manager.getToken('token-test');
    expect(token).toBeDefined();
  });
  it('should bind role', async () => {
    await manager.create({ name: 'role-test' });
    await manager.bindRole('role-test', 'admin', 'ClusterRole');
    const bindings = await manager.getRoleBindings('role-test');
    expect(bindings.length).toBeGreaterThan(0);
  });
  it('should list service accounts', async () => {
    await manager.create({ name: 'list-sa-1' });
    const accounts = await manager.list();
    expect(accounts.length).toBeGreaterThan(0);
  });
});