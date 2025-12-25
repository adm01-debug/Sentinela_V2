/**
 * CI/CD & GitOps Example
 */
import { CICDPipeline } from '../src/cicd';
import { GitOpsReconciler } from '../src/gitops';
import { SecretVault } from '../src/secretManagement';

async function cicdExample() {
  const pipeline = new CICDPipeline();
  pipeline
    .addStage('checkout')
    .addStage('install')
    .addStage('lint')
    .addStage('test')
    .addStage('build')
    .addStage('deploy');
  
  await pipeline.run();
  console.log('Pipeline stages:', pipeline.getStages());
}

async function gitopsExample() {
  const reconciler = new GitOpsReconciler();
  reconciler.setDesired({ replicas: 3, image: 'app:v2', env: 'production' });
  reconciler.setActual({ replicas: 2, image: 'app:v1', env: 'production' });
  
  const result = await reconciler.reconcile();
  console.log('Synced:', result.synced, 'Changes:', result.changes);
}

async function secretsExample() {
  const vault = new SecretVault();
  await vault.set('db-password', 'super-secret-123');
  await vault.set('api-key', 'key-456');
  
  console.log('Secrets:', await vault.list());
  console.log('DB Password:', await vault.get('db-password'));
}

cicdExample();
gitopsExample();
secretsExample();
