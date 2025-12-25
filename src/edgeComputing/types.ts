/**
 * @fileoverview Edge computing types
 * @module @sentinela/core/edgeComputing
 * @version 13.0.0
 */

export interface EdgeFunction { id: string; name: string; code: string; routes: string[]; env: Record<string, string>; }
export interface EdgeLocation { id: string; region: string; latency: number; healthy: boolean; }
export interface EdgeDeployment { functionId: string; locations: string[]; status: 'deploying' | 'active' | 'failed'; version: string; }