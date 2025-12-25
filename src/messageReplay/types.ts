/**
 * @fileoverview Message replay types
 * @module @sentinela/core/messageReplay
 * @version 13.0.0
 */

export interface ReplayMessage { id: string; topic: string; payload: unknown; timestamp: Date; metadata: Record<string, string>; }
export interface ReplayConfig { fromTimestamp?: Date; toTimestamp?: Date; topics?: string[]; batchSize: number; speed: number; }
export interface ReplayStatus { status: 'idle' | 'running' | 'paused' | 'completed'; messagesReplayed: number; currentPosition: number; totalMessages: number; }