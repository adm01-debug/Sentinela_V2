import { ModelRegistry, Model, ModelVersion } from '../../modelRegistry';
describe('ModelRegistry', () => {
  let registry: ModelRegistry;
  beforeEach(() => { registry = new ModelRegistry(); });
  it('should register model', async () => {
    await registry.register({
      name: 'fraud-detector',
      version: '1.0.0',
      type: 'classification',
      artifacts: { model: 'path/to/model' }
    });
    const model = await registry.get('fraud-detector', '1.0.0');
    expect(model).toBeDefined();
  });
  it('should list model versions', async () => {
    await registry.register({ name: 'test', version: '1.0.0', type: 'regression' });
    await registry.register({ name: 'test', version: '2.0.0', type: 'regression' });
    const versions = await registry.listVersions('test');
    expect(versions.length).toBe(2);
  });
  it('should promote model', async () => {
    await registry.register({ name: 'prod-model', version: '1.0.0', type: 'classification' });
    await registry.promote('prod-model', '1.0.0', 'production');
    const model = await registry.get('prod-model', '1.0.0');
    expect(model.stage).toBe('production');
  });
});