/**
 * @fileoverview Tokenization types
 * @module @sentinela/core/tokenization
 * @version 13.0.0
 */

export interface Token { id: string; value: string; originalFormat: string; createdAt: Date; expiresAt?: Date; metadata?: Record<string, string>; }
export interface TokenizationConfig { format: TokenFormat; preserveFormat: boolean; ttl?: number; }
export type TokenFormat = 'uuid' | 'numeric' | 'alphanumeric' | 'format_preserving';