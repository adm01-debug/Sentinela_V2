/**
 * Kubernetes patterns example
 */
import { HPAController } from '../src/hpa';
import { PDBManager } from '../src/podDisruptionBudget';
import { ResourceQuotaManager } from '../src/resourceQuotas';
const hpa = new HPAController({ minReplicas: 2, maxReplicas: 10, targetCPU: 70 });
const pdb = new PDBManager();
const quota = new ResourceQuotaManager();
async function setup() {
  await pdb.create({ name: 'api-pdb', minAvailable: 2, selector: { app: 'api' } });
  await quota.set({ namespace: 'prod', cpu: '100', memory: '200Gi', pods: '50' });
}
async function scale() {
  hpa.updateMetrics({ cpu: 85, memory: 60 });
  const decision = await hpa.evaluate();
  console.log('Scaling:', decision);
}
