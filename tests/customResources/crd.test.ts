import { CustomResourceManager, CRD, CustomResource } from '../../customResources';
describe('CustomResourceManager', () => {
  let manager: CustomResourceManager;
  beforeEach(() => { manager = new CustomResourceManager(); });
  it('should register CRD', async () => {
    await manager.registerCRD({
      group: 'example.com',
      version: 'v1',
      kind: 'Database',
      plural: 'databases',
      scope: 'Namespaced'
    });
    const crd = await manager.getCRD('databases.example.com');
    expect(crd).toBeDefined();
  });
  it('should create custom resource', async () => {
    await manager.registerCRD({ group: 'test.com', version: 'v1', kind: 'Test', plural: 'tests' });
    const cr = await manager.create('tests.test.com', {
      metadata: { name: 'my-test' },
      spec: { foo: 'bar' }
    });
    expect(cr.metadata.name).toBe('my-test');
  });
  it('should list custom resources', async () => {
    await manager.registerCRD({ group: 'list.com', version: 'v1', kind: 'Item', plural: 'items' });
    await manager.create('items.list.com', { metadata: { name: 'i1' }, spec: {} });
    const items = await manager.list('items.list.com');
    expect(items.length).toBeGreaterThan(0);
  });
});