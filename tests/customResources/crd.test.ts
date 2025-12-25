import { CRDManager } from '../../customResources';
describe('CRDManager', () => {
  it('should create CRD', async () => {
    const manager = new CRDManager();
    const crd = await manager.create({ name: 'myresources.example.com', spec: {} });
    expect(crd.name).toBe('myresources.example.com');
  });
});
