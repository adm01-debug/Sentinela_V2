/**
 * ML Pipeline Example
 */
import { MLPipeline } from '../src/mlPipeline';
import { FeatureStore } from '../src/featureStore';
import { ModelRegistry } from '../src/modelRegistry';
import { ModelServer } from '../src/modelServing';

async function main() {
  // Feature Store
  const featureStore = new FeatureStore();
  await featureStore.register({ name: 'user-embedding', version: 1, vector: [0.1, 0.2, 0.3, 0.4] });
  
  // ML Pipeline
  const pipeline = new MLPipeline();
  pipeline
    .add({ name: 'normalize', transform: async (d: number[]) => d.map(x => x / 255) })
    .add({ name: 'augment', transform: async (d: number[]) => [...d, ...d.map(x => x * 0.9)] });
  
  const processed = await pipeline.execute([100, 150, 200]);
  console.log('Processed:', processed);
  
  // Model Registry
  const registry = new ModelRegistry();
  await registry.register({ id: 'clf-v1', name: 'classifier', version: '1.0.0', artifact: 's3://models/clf-v1' });
  
  // Model Server
  const server = new ModelServer();
  server.deploy({ name: 'classifier', version: '1.0.0', endpoint: '/predict' });
  const prediction = await server.predict('classifier', { features: [0.1, 0.2, 0.3] });
  console.log('Prediction:', prediction);
}

main();
