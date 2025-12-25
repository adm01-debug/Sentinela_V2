import { ServiceCatalog } from '../../serviceCatalog';
describe('ServiceCatalog', () => {
  let catalog: ServiceCatalog;
  beforeEach(() => { catalog = new ServiceCatalog(); });
  it('should register and search services', () => {
    catalog.register({ name: 'user-api', version: '1.0', description: 'User management', endpoints: ['/users'] });
    catalog.register({ name: 'order-api', version: '2.0', description: 'Order processing', endpoints: ['/orders'] });
    expect(catalog.search('user').length).toBe(1);
    expect(catalog.list().length).toBe(2);
  });
});
