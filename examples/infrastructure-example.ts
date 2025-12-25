/**
 * Infrastructure Example
 */
import { NamespaceManager } from '../src/namespaceManagement';
import { ServiceAccountManager } from '../src/serviceAccounts';
import { NetworkPolicyManager } from '../src/networkPolicy';
import { ImageRegistry } from '../src/imageRegistry';
import { Operator } from '../src/operators';
import { AdmissionController } from '../src/admissionControllers';
import { IngressManager } from '../src/ingressController';

async function namespaceExample() {
  const ns = new NamespaceManager();
  await ns.create({ name: 'production', labels: { env: 'prod', team: 'platform' } });
  await ns.create({ name: 'staging', labels: { env: 'staging' } });
  console.log('Namespaces:', await ns.list());
}

async function serviceAccountExample() {
  const sa = new ServiceAccountManager();
  await sa.create({ name: 'api-sa', namespace: 'production' });
  await sa.addSecret('production', 'api-sa', 'api-token');
  console.log('Service Account:', await sa.get('production', 'api-sa'));
}

function networkPolicyExample() {
  const np = new NetworkPolicyManager();
  np.create({ name: 'api-policy', ingress: ['frontend', 'load-balancer'], egress: ['database', 'cache', 'external-api'] });
  console.log('Traffic allowed:', np.isAllowed('api-policy', 'frontend', 'database'));
}

async function registryExample() {
  const registry = new ImageRegistry({ url: 'registry.example.com' });
  await registry.push({ name: 'api', tag: 'v1.0.0', digest: 'sha256:abc123', size: 150000000 });
  await registry.push({ name: 'api', tag: 'v1.0.1', digest: 'sha256:def456', size: 152000000 });
  console.log('Images:', await registry.list());
  console.log('API tags:', await registry.getTags('api'));
}

async function operatorExample() {
  const op = new Operator({ kind: 'MyCustomResource' });
  await op.start();
  console.log('Operator watching:', op.isWatching());
  await op.stop();
}

async function admissionExample() {
  const ctrl = new AdmissionController();
  ctrl.addValidator(req => req.kind === 'Pod' || req.kind === 'Deployment');
  ctrl.addMutator(() => [{ op: 'add', path: '/metadata/labels/managed-by', value: 'sentinela' }]);
  console.log('Validate Pod:', await ctrl.validate({ kind: 'Pod', spec: {} }));
  console.log('Mutate:', await ctrl.mutate({ kind: 'Pod', spec: {} }));
}

async function ingressExample() {
  const ingress = new IngressManager();
  await ingress.updateRules('main', [
    { path: '/api', service: 'api-service', port: 3000 },
    { path: '/web', service: 'web-service', port: 8080 },
    { path: '/', service: 'default-service' }
  ]);
  console.log('Route /api/users:', await ingress.route('/api/users'));
}

namespaceExample();
serviceAccountExample();
networkPolicyExample();
registryExample();
operatorExample();
admissionExample();
ingressExample();
