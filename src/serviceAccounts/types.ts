export interface ServiceAccount { name: string; namespace: string; secrets?: SecretRef[]; imagePullSecrets?: LocalObjectReference[]; automountServiceAccountToken?: boolean; }
export interface SecretRef { name: string; }
export interface LocalObjectReference { name: string; }
export interface TokenRequest { audience?: string[]; expirationSeconds?: number; boundObjectRef?: BoundObjectReference; }
export interface BoundObjectReference { kind: string; name: string; uid: string; }
export interface TokenResponse { token: string; expirationTimestamp: Date; }