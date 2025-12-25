export interface PoolConfig { minSize: number; maxSize: number; acquireTimeout?: number; }
export interface PooledConnection { id: string; createdAt: Date; lastUsedAt: Date; }
