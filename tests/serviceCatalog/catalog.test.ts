import { ServiceCatalog } from '../../serviceCatalog';

describe('ServiceCatalog', () => {
  it('should register service', async () => {
    const catalog = new ServiceCatalog();
    await catalog.register({ name: 'user-service', version: '1.0.0', endpoints: [] });
    const service = await catalog.find('user-service');
    expect(service).toBeDefined();
  });
});
