import { ServiceMesh, Sidecar, TrafficPolicy } from '../../serviceMesh';

describe('ServiceMesh', () => {
  let mesh: ServiceMesh;

  beforeEach(() => {
    mesh = new ServiceMesh({
      name: 'test-mesh'
    });
  });

  it('should register service', () => {
    mesh.registerService({
      name: 'payment-service',
      version: '1.0.0',
      endpoints: ['http://localhost:3000']
    });

    const service = mesh.getService('payment-service');
    expect(service).toBeDefined();
    expect(service.version).toBe('1.0.0');
  });

  it('should apply traffic policy', () => {
    mesh.registerService({
      name: 'api-service',
      version: '1.0.0',
      endpoints: ['http://localhost:3001']
    });

    mesh.applyPolicy('api-service', {
      retries: 3,
      timeout: 5000,
      circuitBreaker: { threshold: 5 }
    });

    const policy = mesh.getPolicy('api-service');
    expect(policy.retries).toBe(3);
  });
});

describe('Sidecar', () => {
  let sidecar: Sidecar;

  beforeEach(() => {
    sidecar = new Sidecar({
      serviceName: 'my-service',
      port: 15000
    });
  });

  afterEach(() => {
    sidecar.stop();
  });

  it('should intercept outbound traffic', async () => {
    const interceptor = jest.fn().mockResolvedValue({ status: 200 });
    sidecar.setOutboundInterceptor(interceptor);

    await sidecar.handleOutbound({
      destination: 'other-service',
      method: 'GET',
      path: '/api/data'
    });

    expect(interceptor).toHaveBeenCalled();
  });

  it('should collect metrics', () => {
    sidecar.recordRequest({ duration: 100, success: true });
    sidecar.recordRequest({ duration: 200, success: true });
    sidecar.recordRequest({ duration: 50, success: false });

    const metrics = sidecar.getMetrics();
    expect(metrics.totalRequests).toBe(3);
    expect(metrics.successRate).toBeCloseTo(0.67, 1);
  });
});
