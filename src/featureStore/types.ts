export interface Feature { id: string; name: string; type: FeatureType; entity: string; description: string; }
export type FeatureType = 'numeric' | 'categorical' | 'embedding' | 'timestamp';
export interface FeatureValue { featureId: string; entityId: string; value: unknown; timestamp: Date; }
export interface FeatureSet { id: string; name: string; features: string[]; }