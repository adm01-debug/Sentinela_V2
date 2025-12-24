export interface VPA { name: string; namespace: string; targetRef: TargetRef; updatePolicy: UpdatePolicy; resourcePolicy?: ResourcePolicy; }
export interface TargetRef { apiVersion: string; kind: string; name: string; }
export interface UpdatePolicy { updateMode: 'Off' | 'Initial' | 'Recreate' | 'Auto'; }
export interface ResourcePolicy { containerPolicies: ContainerPolicy[]; }
export interface ContainerPolicy { containerName: string; minAllowed?: Resources; maxAllowed?: Resources; mode?: 'Auto' | 'Off'; }
export interface Resources { cpu?: string; memory?: string; }
export interface Recommendation { containerRecommendations: ContainerRecommendation[]; }
export interface ContainerRecommendation { containerName: string; lowerBound: Resources; target: Resources; upperBound: Resources; }