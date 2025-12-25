import { ModelRegistry } from '../../modelRegistry';
describe('ModelRegistry', () => {
  let registry: ModelRegistry;
  beforeEach(() => { registry = new ModelRegistry(); });
  it('should register and list models', async () => {
    await registry.register({ id: 'm1', name: 'classifier', version: '1.0', artifact: 's3://models/clf' });
    const models = await registry.list();
    expect(models.length).toBe(1);
  });
});
