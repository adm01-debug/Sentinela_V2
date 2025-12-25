import { ServiceDiscovery, ServiceInstance, LoadBalancer } from '../../serviceDiscovery';

describe('ServiceDiscovery', () => {
  let discovery: ServiceDiscovery;

  beforeEach(() => {
    discovery = new ServiceDiscovery({
      refreshInterval: 5000
    });
  });

  afterEach(() => {
    discovery.dispose();
  });

  it('should register service instance', async () => {
    const instance: ServiceInstance = {
      id: 'instance-1',
      serviceName: 'user-service',
      host: 'localhost',
      port: 3000,
      metadata: { version: '1.0.0' }
    };

    await discovery.register(instance);
    const instances = await discovery.getInstances('user-service');

    expect(instances.length).toBe(1);
    expect(instances[0].id).toBe('instance-1');
  });

  it('should deregister service instance', async () => {
    await discovery.register({
      id: 'instance-2',
      serviceName: 'order-service',
      host: 'localhost',
      port: 3001
    });

    await discovery.deregister('instance-2');
    const instances = await discovery.getInstances('order-service');

    expect(instances.length).toBe(0);
  });

  it('should get healthy instances only', async () => {
    await discovery.register({
      id: 'healthy-1',
      serviceName: 'api',
      host: 'localhost',
      port: 3000,
      healthy: true
    });

    await discovery.register({
      id: 'unhealthy-1',
      serviceName: 'api',
      host: 'localhost',
      port: 3001,
      healthy: false
    });

    const healthy = await discovery.getHealthyInstances('api');
    expect(healthy.length).toBe(1);
    expect(healthy[0].id).toBe('healthy-1');
  });
});

describe('LoadBalancer', () => {
  let lb: LoadBalancer;
  const instances = [
    { id: '1', host: 'host1', port: 3000 },
    { id: '2', host: 'host2', port: 3000 },
    { id: '3', host: 'host3', port: 3000 }
  ];

  describe('round-robin', () => {
    beforeEach(() => {
      lb = new LoadBalancer({ strategy: 'round-robin' });
    });

    it('should rotate through instances', () => {
      const selected = [
        lb.select(instances),
        lb.select(instances),
        lb.select(instances),
        lb.select(instances)
      ];

      expect(selected[0].id).toBe('1');
      expect(selected[1].id).toBe('2');
      expect(selected[2].id).toBe('3');
      expect(selected[3].id).toBe('1');
    });
  });

  describe('random', () => {
    beforeEach(() => {
      lb = new LoadBalancer({ strategy: 'random' });
    });

    it('should select instances', () => {
      const selected = lb.select(instances);
      expect(instances).toContainEqual(selected);
    });
  });
});
