/**
 * @fileoverview Dead letter queue types
 * @module @sentinela/core/deadLetter
 * @version 13.0.0
 */

export interface DeadLetterMessage { id: string; originalTopic: string; payload: unknown; error: string; failedAt: Date; retryCount: number; metadata: Record<string, string>; }
export interface DLQConfig { maxRetries: number; retryDelay: number; ttl: number; }