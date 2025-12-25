import { Sidecar, SidecarConfig, SidecarMetrics } from '../../sidecar';
describe('Sidecar', () => {
  let sidecar: Sidecar;
  beforeEach(() => { sidecar = new Sidecar({ port: 15000 }); });
  afterEach(() => { sidecar.stop(); });
  it('should intercept inbound traffic', async () => {
    const handler = jest.fn().mockResolvedValue({ status: 200 });
    sidecar.onInbound(handler);
    await sidecar.handleInbound({ path: '/api', method: 'GET' });
    expect(handler).toHaveBeenCalled();
  });
  it('should intercept outbound traffic', async () => {
    const handler = jest.fn().mockResolvedValue({ status: 200 });
    sidecar.onOutbound(handler);
    await sidecar.handleOutbound({ destination: 'service-b', path: '/api' });
    expect(handler).toHaveBeenCalled();
  });
  it('should collect metrics', () => {
    sidecar.recordMetric({ type: 'request', duration: 100 });
    sidecar.recordMetric({ type: 'request', duration: 200 });
    const metrics = sidecar.getMetrics();
    expect(metrics.totalRequests).toBe(2);
  });
  it('should health check', async () => {
    const health = await sidecar.healthCheck();
    expect(health.status).toBeDefined();
  });
});