import { ServiceCatalog, ServiceEntry, Category } from '../../serviceCatalog';
describe('ServiceCatalog', () => {
  let catalog: ServiceCatalog;
  beforeEach(() => { catalog = new ServiceCatalog(); });
  it('should register service', async () => {
    await catalog.register({
      name: 'user-service',
      description: 'User management',
      owner: 'team-a',
      endpoints: [{ url: 'http://users', protocol: 'http' }]
    });
    const service = await catalog.get('user-service');
    expect(service).toBeDefined();
  });
  it('should search services', async () => {
    await catalog.register({ name: 'auth-service', tags: ['security'] });
    await catalog.register({ name: 'payment-service', tags: ['billing'] });
    const results = await catalog.search({ tags: ['security'] });
    expect(results.length).toBe(1);
  });
  it('should list by category', async () => {
    await catalog.register({ name: 's1', category: 'infrastructure' });
    await catalog.register({ name: 's2', category: 'application' });
    const infra = await catalog.listByCategory('infrastructure');
    expect(infra.length).toBe(1);
  });
});