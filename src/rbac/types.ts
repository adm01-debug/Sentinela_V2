export interface Role { name: string; namespace?: string; rules: PolicyRule[]; }
export interface ClusterRole { name: string; rules: PolicyRule[]; aggregationRule?: AggregationRule; }
export interface PolicyRule { apiGroups: string[]; resources: string[]; verbs: string[]; resourceNames?: string[]; }
export interface AggregationRule { clusterRoleSelectors: { matchLabels: Record<string, string> }[]; }
export interface RoleBinding { name: string; namespace: string; roleRef: RoleRef; subjects: Subject[]; }
export interface ClusterRoleBinding { name: string; roleRef: RoleRef; subjects: Subject[]; }
export interface RoleRef { apiGroup: string; kind: 'Role' | 'ClusterRole'; name: string; }
export interface Subject { kind: 'User' | 'Group' | 'ServiceAccount'; name: string; namespace?: string; }