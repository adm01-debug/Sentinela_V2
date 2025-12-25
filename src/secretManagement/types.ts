/**
 * @fileoverview Secret management types
 * @module @sentinela/core/secretManagement
 * @version 13.0.0
 */

export interface Secret { id: string; name: string; value: string; version: number; metadata: SecretMetadata; }
export interface SecretMetadata { createdAt: Date; updatedAt: Date; expiresAt?: Date; rotationPolicy?: RotationPolicy; }
export interface RotationPolicy { enabled: boolean; intervalDays: number; lastRotation?: Date; }
export interface AccessPolicy { secretId: string; principals: string[]; permissions: Permission[]; }
export type Permission = 'read' | 'write' | 'rotate' | 'delete';