export interface NetworkPolicyAdvanced { name: string; namespace: string; podSelector: LabelSelector; policyTypes: ('Ingress' | 'Egress')[]; ingress?: IngressRule[]; egress?: EgressRule[]; }
export interface LabelSelector { matchLabels?: Record<string, string>; matchExpressions?: LabelSelectorRequirement[]; }
export interface LabelSelectorRequirement { key: string; operator: 'In' | 'NotIn' | 'Exists' | 'DoesNotExist'; values?: string[]; }
export interface IngressRule { from?: NetworkPolicyPeer[]; ports?: NetworkPolicyPort[]; }
export interface EgressRule { to?: NetworkPolicyPeer[]; ports?: NetworkPolicyPort[]; }
export interface NetworkPolicyPeer { podSelector?: LabelSelector; namespaceSelector?: LabelSelector; ipBlock?: IPBlock; }
export interface NetworkPolicyPort { protocol?: 'TCP' | 'UDP' | 'SCTP'; port?: number | string; endPort?: number; }
export interface IPBlock { cidr: string; except?: string[]; }