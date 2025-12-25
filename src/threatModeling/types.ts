/**
 * @fileoverview Threat modeling types
 * @module @sentinela/core/threatModeling
 * @version 13.0.0
 */

export interface ThreatModel { id: string; name: string; assets: Asset[]; threats: Threat[]; dataFlows: DataFlow[]; trustBoundaries: TrustBoundary[]; }
export interface Asset { id: string; name: string; type: 'data' | 'process' | 'external'; sensitivity: 'low' | 'medium' | 'high'; }
export interface Threat { id: string; name: string; category: STRIDECategory; target: string; likelihood: number; impact: number; mitigations: string[]; }
export type STRIDECategory = 'spoofing' | 'tampering' | 'repudiation' | 'information_disclosure' | 'denial_of_service' | 'elevation_of_privilege';
export interface DataFlow { id: string; from: string; to: string; data: string; encrypted: boolean; }
export interface TrustBoundary { id: string; name: string; contains: string[]; }