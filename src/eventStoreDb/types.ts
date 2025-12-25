/**
 * @fileoverview EventStoreDB types
 * @module @sentinela/core/eventStoreDb
 * @version 13.0.0
 */

export interface Event { eventId: string; eventType: string; data: unknown; metadata?: unknown; }
export interface RecordedEvent extends Event { streamId: string; streamPosition: number; globalPosition: number; created: Date; }
export interface StreamMetadata { maxCount?: number; maxAge?: number; cacheControl?: string; acl?: StreamAcl; }
export interface StreamAcl { readRoles: string[]; writeRoles: string[]; }