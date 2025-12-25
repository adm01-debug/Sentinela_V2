import { ServiceCatalog, Service, ServiceBinding } from '../../serviceCatalog';
describe('ServiceCatalog', () => {
  let catalog: ServiceCatalog;
  beforeEach(() => { catalog = new ServiceCatalog(); });
  it('should register service', async () => {
    const svc = await catalog.register({
      name: 'database', type: 'postgresql', plans: ['small', 'medium', 'large']
    });
    expect(svc.id).toBeDefined();
  });
  it('should list services', async () => {
    await catalog.register({ name: 'db', type: 'mysql', plans: ['basic'] });
    await catalog.register({ name: 'cache', type: 'redis', plans: ['standard'] });
    const services = await catalog.list();
    expect(services.length).toBe(2);
  });
  it('should provision instance', async () => {
    await catalog.register({ name: 'mq', type: 'rabbitmq', plans: ['free'] });
    const instance = await catalog.provision('mq', 'free', { name: 'my-mq' });
    expect(instance.status).toBe('provisioned');
  });
  it('should bind to application', async () => {
    await catalog.register({ name: 'storage', type: 's3', plans: ['basic'] });
    const instance = await catalog.provision('storage', 'basic', { name: 'my-bucket' });
    const binding = await catalog.bind(instance.id, 'my-app');
    expect(binding.credentials).toBeDefined();
  });
});