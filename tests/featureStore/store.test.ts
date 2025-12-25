import { FeatureStore } from '../../featureStore';
describe('FeatureStore', () => {
  let store: FeatureStore;
  beforeEach(() => { store = new FeatureStore(); });
  it('should register and get features', async () => {
    await store.register({ name: 'user-embedding', version: 1, vector: [0.1, 0.2, 0.3] });
    const feature = await store.get('user-embedding');
    expect(feature?.vector).toEqual([0.1, 0.2, 0.3]);
  });
});
