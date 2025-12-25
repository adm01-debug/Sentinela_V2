/**
 * @fileoverview Connection pool types
 * @module @sentinela/core/connectionPool
 * @version 13.0.0
 */

export interface PoolConfig { minConnections: number; maxConnections: number; acquireTimeout: number; idleTimeout: number; }
export interface Connection { id: string; createdAt: Date; lastUsedAt: Date; inUse: boolean; }
export interface PoolStats { total: number; inUse: number; idle: number; waiting: number; }