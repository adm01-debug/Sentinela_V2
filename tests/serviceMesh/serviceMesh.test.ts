import { ServiceMeshSidecar } from '../../serviceMesh';

describe('ServiceMeshSidecar', () => {
  let sidecar: ServiceMeshSidecar;
  beforeEach(() => { sidecar = new ServiceMeshSidecar({ serviceName: 'test-service' }); });

  it('should intercept outbound requests', async () => {
    const result = await sidecar.intercept({ url: 'http://other-service/api', method: 'GET' });
    expect(result).toBeDefined();
  });

  it('should report metrics', () => {
    const metrics = sidecar.getMetrics();
    expect(metrics).toHaveProperty('requestCount');
  });
});
