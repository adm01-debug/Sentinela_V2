import { ServiceMesh } from '../../serviceMeshAdvanced';
describe('ServiceMesh', () => {
  it('should configure service', async () => {
    const mesh = new ServiceMesh();
    await mesh.configure('my-service', { timeout: 30, retries: 3 });
    const config = await mesh.getConfig('my-service');
    expect(config.timeout).toBe(30);
  });
});
