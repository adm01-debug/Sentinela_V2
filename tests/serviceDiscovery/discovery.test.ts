import { ServiceDiscovery } from '../../serviceDiscovery';

describe('ServiceDiscovery', () => {
  let discovery: ServiceDiscovery;
  beforeEach(() => { discovery = new ServiceDiscovery(); });

  it('should register service', async () => {
    await discovery.register({ name: 'api', host: 'localhost', port: 3000 });
    const services = await discovery.find('api');
    expect(services.length).toBeGreaterThan(0);
  });

  it('should deregister service', async () => {
    const id = await discovery.register({ name: 'api', host: 'localhost', port: 3000 });
    await discovery.deregister(id);
    const services = await discovery.find('api');
    expect(services.length).toBe(0);
  });
});
