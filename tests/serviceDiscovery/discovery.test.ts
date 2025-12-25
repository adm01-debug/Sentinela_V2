import { ServiceDiscovery } from '../../serviceDiscovery';
describe('ServiceDiscovery', () => {
  let discovery: ServiceDiscovery;
  beforeEach(() => { discovery = new ServiceDiscovery(); });
  it('should register and find services', async () => {
    const id = await discovery.register({ name: 'api', host: 'localhost', port: 3000 });
    const instances = await discovery.find('api');
    expect(instances.length).toBe(1);
    expect(instances[0].id).toBe(id);
  });
  it('should filter unhealthy services', async () => {
    const id = await discovery.register({ name: 'api', host: 'localhost', port: 3000 });
    await discovery.updateHealth(id, 'unhealthy');
    const instances = await discovery.find('api');
    expect(instances.length).toBe(0);
  });
});
