export interface ManagedKey { id: string; alias: string; type: 'symmetric' | 'asymmetric'; algorithm: string; state: KeyState; metadata: KeyMetadata; }
export type KeyState = 'enabled' | 'disabled' | 'pending_deletion' | 'deleted';
export interface KeyMetadata { createdAt: Date; createdBy: string; rotatedAt?: Date; expiresAt?: Date; tags: Record<string, string>; }
export interface KeyPolicy { id: string; keyId: string; principals: string[]; actions: string[]; }