import { APIComposer, CompositionConfig, ComposedResponse } from '../../apiComposition';
describe('APIComposer', () => {
  let composer: APIComposer;
  beforeEach(() => { composer = new APIComposer(); });
  it('should compose multiple APIs', async () => {
    composer.addSource('users', { url: 'http://users/api', transform: (d) => d });
    composer.addSource('orders', { url: 'http://orders/api', transform: (d) => d });
    const result = await composer.compose(['users', 'orders']);
    expect(result.users).toBeDefined();
    expect(result.orders).toBeDefined();
  });
  it('should handle failures gracefully', async () => {
    composer.addSource('working', { url: 'http://ok', transform: (d) => d });
    composer.addSource('failing', { url: 'http://fail', transform: (d) => d, optional: true });
    const result = await composer.compose(['working', 'failing']);
    expect(result.working).toBeDefined();
  });
  it('should cache composed results', async () => {
    composer.addSource('cached', { url: 'http://cached', transform: (d) => d, cache: 60000 });
    await composer.compose(['cached']);
    const cached = composer.getFromCache('cached');
    expect(cached).toBeDefined();
  });
});