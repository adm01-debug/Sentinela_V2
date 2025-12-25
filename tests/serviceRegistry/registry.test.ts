import { ServiceRegistry, RegistryEntry, RegistryWatcher } from '../../serviceRegistry';
describe('ServiceRegistry', () => {
  let registry: ServiceRegistry;
  beforeEach(() => { registry = new ServiceRegistry(); });
  it('should register service', async () => {
    await registry.register({
      name: 'user-service',
      host: 'localhost',
      port: 3000,
      metadata: { version: '1.0.0' }
    });
    const service = await registry.get('user-service');
    expect(service.host).toBe('localhost');
  });
  it('should deregister service', async () => {
    await registry.register({ name: 'temp-service', host: 'localhost', port: 3001 });
    await registry.deregister('temp-service');
    const service = await registry.get('temp-service');
    expect(service).toBeNull();
  });
  it('should list all services', async () => {
    await registry.register({ name: 's1', host: 'h1', port: 1 });
    await registry.register({ name: 's2', host: 'h2', port: 2 });
    const services = await registry.list();
    expect(services.length).toBe(2);
  });
  it('should watch for changes', (done) => {
    registry.watch('watched-service', (event) => {
      expect(event.type).toBe('registered');
      done();
    });
    registry.register({ name: 'watched-service', host: 'h', port: 1 });
  });
});