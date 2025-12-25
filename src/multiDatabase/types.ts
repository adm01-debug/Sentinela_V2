/**
 * @fileoverview Multi-database types
 * @module @sentinela/core/multiDatabase
 * @version 13.0.0
 */

export interface DatabaseConfig { name: string; driver: 'mysql' | 'postgres' | 'sqlite' | 'mongodb'; host: string; port: number; database: string; username?: string; password?: string; }
export interface ConnectionState { name: string; connected: boolean; lastUsed: Date; queryCount: number; }