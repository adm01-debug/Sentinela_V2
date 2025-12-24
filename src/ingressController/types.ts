export interface Ingress { name: string; namespace: string; rules: IngressRule[]; tls?: IngressTLS[]; }
export interface IngressRule { host: string; http: HTTPIngressRuleValue; }
export interface HTTPIngressRuleValue { paths: HTTPIngressPath[]; }
export interface HTTPIngressPath { path: string; pathType: 'Exact' | 'Prefix' | 'ImplementationSpecific'; backend: IngressBackend; }
export interface IngressBackend { service: { name: string; port: { number: number } }; }
export interface IngressTLS { hosts: string[]; secretName: string; }