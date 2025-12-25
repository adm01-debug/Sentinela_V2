/**
 * Kubernetes patterns example
 */
import {
  HPAController,
  PDBManager,
  ResourceQuotaManager,
  StatefulSetManager
} from '@sentinela/core';

// Horizontal Pod Autoscaler
async function hpaExample() {
  const hpa = new HPAController({ minReplicas: 2, maxReplicas: 10, targetCPU: 70 });
  hpa.updateMetrics({ cpu: 85, memory: 60 });
  const decision = await hpa.evaluate();
  console.log('HPA decision:', decision);
}

// Pod Disruption Budget
async function pdbExample() {
  const pdb = new PDBManager();
  await pdb.create({ name: 'api-pdb', minAvailable: 2, selector: { app: 'api' } });
  console.log('PDB created');
}

// Resource Quotas
async function quotaExample() {
  const quotaManager = new ResourceQuotaManager();
  await quotaManager.set({
    namespace: 'production',
    cpu: '100',
    memory: '200Gi',
    pods: '50'
  });
  console.log('Quota set');
}

// StatefulSet
async function statefulSetExample() {
  const stsManager = new StatefulSetManager();
  await stsManager.create({
    name: 'postgres',
    replicas: 3,
    volumeClaim: { size: '100Gi', storageClass: 'fast' }
  });
  console.log('StatefulSet created');
}

Promise.all([hpaExample(), pdbExample(), quotaExample(), statefulSetExample()]);
