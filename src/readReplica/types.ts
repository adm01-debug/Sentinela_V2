export interface Replica { id: string; host: string; port: number; role: 'primary' | 'replica'; status: ReplicaStatus; lag: number; }
export type ReplicaStatus = 'online' | 'offline' | 'syncing' | 'lagging';
export interface ReplicationConfig { maxLag: number; readPreference: 'primary' | 'secondary' | 'nearest'; }