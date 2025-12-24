import { K8sConfig } from './k8sConfig';
export type ServiceType = 'ClusterIP' | 'NodePort' | 'LoadBalancer';
export interface ServiceSpec { type: ServiceType; port: number; targetPort: number; selector: Record<string, string>; }
export class ServiceGenerator {
  generate(name: string, spec: ServiceSpec): K8sConfig { return { apiVersion: 'v1', kind: 'Service', metadata: { name }, spec: { type: spec.type, ports: [{ port: spec.port, targetPort: spec.targetPort }], selector: spec.selector } }; }
  generateClusterIP(name: string, port: number, selector: Record<string, string>): K8sConfig { return this.generate(name, { type: 'ClusterIP', port, targetPort: port, selector }); }
  generateLoadBalancer(name: string, port: number, selector: Record<string, string>): K8sConfig { return this.generate(name, { type: 'LoadBalancer', port, targetPort: port, selector }); }
}
export const serviceGenerator = new ServiceGenerator();
