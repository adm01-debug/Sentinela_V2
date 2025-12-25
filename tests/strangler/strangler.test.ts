import { Strangler, StranglerConfig, MigrationPath } from '../../strangler';
describe('Strangler', () => {
  let strangler: Strangler;
  beforeEach(() => { strangler = new Strangler(); });
  it('should register legacy endpoint', () => {
    strangler.registerLegacy({
      path: '/api/v1/users',
      handler: async () => ({ users: [] })
    });
    expect(strangler.getLegacyEndpoints()).toContain('/api/v1/users');
  });
  it('should register new endpoint', () => {
    strangler.registerNew({
      path: '/api/v2/users',
      handler: async () => ({ users: [] })
    });
    expect(strangler.getNewEndpoints()).toContain('/api/v2/users');
  });
  it('should route based on percentage', async () => {
    strangler.registerLegacy({ path: '/api/test', handler: async () => 'legacy' });
    strangler.registerNew({ path: '/api/test', handler: async () => 'new' });
    strangler.setMigrationPercentage('/api/test', 50);
    const result = await strangler.route('/api/test');
    expect(['legacy', 'new']).toContain(result);
  });
  it('should complete migration', () => {
    strangler.registerLegacy({ path: '/api/migrate', handler: async () => {} });
    strangler.registerNew({ path: '/api/migrate', handler: async () => {} });
    strangler.setMigrationPercentage('/api/migrate', 100);
    strangler.completeMigration('/api/migrate');
    expect(strangler.getLegacyEndpoints()).not.toContain('/api/migrate');
  });
});