export interface ThreatModel { id: string; name: string; assets: Asset[]; threats: Threat[]; dataFlows: DataFlow[]; trustBoundaries: TrustBoundary[]; }
export interface Asset { id: string; name: string; type: 'data' | 'process' | 'external'; sensitivity: 'low' | 'medium' | 'high' | 'critical'; }
export interface Threat { id: string; category: STRIDECategory; description: string; targetAsset: string; likelihood: 1 | 2 | 3 | 4 | 5; impact: 1 | 2 | 3 | 4 | 5; mitigations: string[]; }
export type STRIDECategory = 'spoofing' | 'tampering' | 'repudiation' | 'information_disclosure' | 'denial_of_service' | 'elevation_of_privilege';
export interface DataFlow { id: string; from: string; to: string; data: string; protocol: string; }
export interface TrustBoundary { id: string; name: string; assets: string[]; }