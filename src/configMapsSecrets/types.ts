/**
 * @fileoverview ConfigMaps and Secrets types
 * @module @sentinela/core/configMapsSecrets
 * @version 13.0.0
 */

export interface ConfigMap { name: string; namespace: string; data: Record<string, string>; binaryData?: Record<string, string>; }
export interface Secret { name: string; namespace: string; type: SecretType; data: Record<string, string>; }
export type SecretType = 'Opaque' | 'kubernetes.io/service-account-token' | 'kubernetes.io/dockercfg' | 'kubernetes.io/tls';
export interface VolumeProjection { configMap?: { name: string; items?: KeyToPath[] }; secret?: { name: string; items?: KeyToPath[] }; }
export interface KeyToPath { key: string; path: string; mode?: number; }