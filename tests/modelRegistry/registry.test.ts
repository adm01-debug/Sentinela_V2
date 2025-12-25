import { ModelRegistry, ModelVersion, ModelMetadata } from '../../modelRegistry';
describe('ModelRegistry', () => {
  let registry: ModelRegistry;
  beforeEach(() => { registry = new ModelRegistry(); });
  it('should register model', async () => {
    const model = await registry.register({
      name: 'sentiment-classifier',
      version: '1.0.0',
      framework: 'pytorch',
      metrics: { accuracy: 0.95 }
    });
    expect(model.id).toBeDefined();
  });
  it('should get latest version', async () => {
    await registry.register({ name: 'test-model', version: '1.0.0', framework: 'tf' });
    await registry.register({ name: 'test-model', version: '2.0.0', framework: 'tf' });
    const latest = await registry.getLatest('test-model');
    expect(latest.version).toBe('2.0.0');
  });
  it('should list versions', async () => {
    await registry.register({ name: 'multi-v', version: '1.0.0', framework: 'tf' });
    await registry.register({ name: 'multi-v', version: '1.1.0', framework: 'tf' });
    const versions = await registry.listVersions('multi-v');
    expect(versions.length).toBe(2);
  });
});