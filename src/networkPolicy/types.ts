export interface NetworkPolicy { name: string; namespace: string; podSelector: Selector; ingress: IngressRule[]; egress: EgressRule[]; }
export interface Selector { matchLabels: Record<string, string>; }
export interface IngressRule { from: PeerSelector[]; ports: PortRule[]; }
export interface EgressRule { to: PeerSelector[]; ports: PortRule[]; }
export interface PeerSelector { podSelector?: Selector; namespaceSelector?: Selector; ipBlock?: IPBlock; }
export interface PortRule { port: number; protocol: 'TCP' | 'UDP'; }
export interface IPBlock { cidr: string; except?: string[]; }