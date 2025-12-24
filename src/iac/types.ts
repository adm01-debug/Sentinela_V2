export interface Stack { name: string; resources: Resource[]; outputs: Output[]; }
export interface Resource { type: string; name: string; properties: Record<string, unknown>; dependsOn?: string[]; }
export interface Output { name: string; value: string; export?: boolean; }
export interface StackState { resources: ResourceState[]; outputs: Record<string, string>; lastApplied: Date; }
export interface ResourceState { name: string; type: string; status: 'created' | 'updated' | 'deleted'; physicalId?: string; }