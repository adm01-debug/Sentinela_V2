import { ModelServer } from '../../modelServing';
describe('ModelServer', () => {
  let server: ModelServer;
  beforeEach(() => { server = new ModelServer(); });
  it('should deploy and predict', async () => {
    server.deploy({ name: 'classifier', version: '1.0', endpoint: '/predict' });
    const result = await server.predict('classifier', { features: [1, 2, 3] });
    expect(result).toHaveProperty('prediction');
  });
});
