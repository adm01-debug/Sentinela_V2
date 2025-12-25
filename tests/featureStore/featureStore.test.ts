import { FeatureStore, FeatureSet, FeatureView } from '../../featureStore';

describe('FeatureStore', () => {
  let store: FeatureStore;

  beforeEach(() => {
    store = new FeatureStore({ name: 'test-store' });
  });

  it('should register feature set', async () => {
    await store.registerFeatureSet({
      name: 'user-features',
      entities: ['user_id'],
      features: [
        { name: 'age', type: 'int' },
        { name: 'total_purchases', type: 'float' }
      ]
    });

    const featureSet = await store.getFeatureSet('user-features');
    expect(featureSet).toBeDefined();
    expect(featureSet.features.length).toBe(2);
  });

  it('should ingest features', async () => {
    await store.registerFeatureSet({
      name: 'product-features',
      entities: ['product_id'],
      features: [{ name: 'price', type: 'float' }]
    });

    await store.ingest('product-features', [
      { product_id: '1', price: 29.99 },
      { product_id: '2', price: 49.99 }
    ]);

    const features = await store.getFeatures('product-features', ['1']);
    expect(features[0].price).toBe(29.99);
  });

  it('should get features for training', async () => {
    await store.registerFeatureSet({
      name: 'training-features',
      entities: ['id'],
      features: [
        { name: 'feature1', type: 'float' },
        { name: 'feature2', type: 'float' }
      ]
    });

    await store.ingest('training-features', [
      { id: '1', feature1: 1.0, feature2: 2.0 },
      { id: '2', feature1: 3.0, feature2: 4.0 }
    ]);

    const trainingData = await store.getTrainingData(
      'training-features',
      ['feature1', 'feature2'],
      ['1', '2']
    );

    expect(trainingData.length).toBe(2);
  });
});
