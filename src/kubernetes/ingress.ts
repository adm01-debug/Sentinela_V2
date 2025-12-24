import { K8sConfig } from './k8sConfig';
export interface IngressRule { host: string; path: string; serviceName: string; servicePort: number; }
export class IngressGenerator {
  generate(name: string, rules: IngressRule[]): K8sConfig { return { apiVersion: 'networking.k8s.io/v1', kind: 'Ingress', metadata: { name, annotations: { 'kubernetes.io/ingress.class': 'nginx' } }, spec: { rules: rules.map(r => ({ host: r.host, http: { paths: [{ path: r.path, pathType: 'Prefix', backend: { service: { name: r.serviceName, port: { number: r.servicePort } } } }] } })) } }; }
}
export const ingressGenerator = new IngressGenerator();
