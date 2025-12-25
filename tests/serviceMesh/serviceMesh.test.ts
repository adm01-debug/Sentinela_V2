import { ServiceMeshSidecar } from '../../serviceMesh';
describe('ServiceMeshSidecar', () => {
  it('should intercept requests when active', async () => {
    const sidecar = new ServiceMeshSidecar({ serviceName: 'api', port: 3000 });
    await sidecar.start();
    const result = await sidecar.intercept({ method: 'GET', path: '/api/users' });
    expect(result.forwarded).toBe(true);
    await sidecar.stop();
  });
});
