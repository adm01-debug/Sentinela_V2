/**
 * Cloud Native Patterns Example
 */
import { HPAController } from '../src/hpa';
import { VPARecommender } from '../src/vpa';
import { PDBManager } from '../src/podDisruptionBudget';
import { ResourceQuotaManager } from '../src/resourceQuotas';
import { ServiceCatalog } from '../src/serviceCatalog';

async function hpaExample() {
  const hpa = new HPAController({ minReplicas: 2, maxReplicas: 10, targetCPU: 70 });
  hpa.updateMetrics({ cpu: 85, memory: 60 });
  const decision = await hpa.evaluate();
  console.log('HPA Decision:', decision);
}

function vpaExample() {
  const vpa = new VPARecommender();
  vpa.addSample(100, 256);
  vpa.addSample(150, 300);
  vpa.addSample(120, 280);
  console.log('VPA Recommendation:', vpa.recommend());
}

async function pdbExample() {
  const pdb = new PDBManager();
  await pdb.create({ name: 'api-pdb', minAvailable: 2, selector: { app: 'api' } });
  console.log('Can disrupt with 3 available:', await pdb.canDisrupt('api-pdb', 3));
  console.log('Can disrupt with 2 available:', await pdb.canDisrupt('api-pdb', 2));
}

async function quotaExample() {
  const quotas = new ResourceQuotaManager();
  await quotas.set({ namespace: 'production', cpu: '100', memory: '200Gi', pods: '50' });
  console.log('Production quota:', await quotas.get('production'));
}

function catalogExample() {
  const catalog = new ServiceCatalog();
  catalog.register({ name: 'user-service', version: '2.0', description: 'User management', endpoints: ['/users', '/auth'] });
  catalog.register({ name: 'order-service', version: '1.5', description: 'Order processing', endpoints: ['/orders'] });
  console.log('All services:', catalog.list());
  console.log('Search "user":', catalog.search('user'));
}

hpaExample();
vpaExample();
pdbExample();
quotaExample();
catalogExample();
