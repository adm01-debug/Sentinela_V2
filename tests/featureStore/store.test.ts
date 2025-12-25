import { FeatureStore } from '../../featureStore';

describe('FeatureStore', () => {
  let store: FeatureStore;
  beforeEach(() => { store = new FeatureStore(); });

  it('should register and retrieve features', async () => {
    await store.register('user_age', { type: 'numeric', source: 'users' });
    const feature = await store.get('user_age');
    expect(feature).toBeDefined();
  });

  it('should get feature vector', async () => {
    await store.register('user_age', { type: 'numeric', source: 'users' });
    await store.register('user_score', { type: 'numeric', source: 'scores' });
    const vector = await store.getVector(['user_age', 'user_score'], 'user-123');
    expect(vector.length).toBe(2);
  });
});
