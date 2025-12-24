import { K8sConfig } from './k8sConfig';
export interface DeploymentSpec { replicas: number; image: string; port: number; env?: Record<string, string>; resources?: { cpu: string; memory: string }; }
export class DeploymentGenerator {
  generate(name: string, spec: DeploymentSpec): K8sConfig { return { apiVersion: 'apps/v1', kind: 'Deployment', metadata: { name, labels: { app: name } }, spec: { replicas: spec.replicas, selector: { matchLabels: { app: name } }, template: { metadata: { labels: { app: name } }, spec: { containers: [{ name, image: spec.image, ports: [{ containerPort: spec.port }], env: spec.env ? Object.entries(spec.env).map(([name, value]) => ({ name, value })) : [], resources: spec.resources ? { limits: { cpu: spec.resources.cpu, memory: spec.resources.memory } } : undefined }] } } } }; }
}
export const deploymentGenerator = new DeploymentGenerator();
