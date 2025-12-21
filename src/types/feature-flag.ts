export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  conditions?: FeatureFlagCondition[];
  createdAt: string;
  updatedAt: string;
}

export interface FeatureFlagCondition {
  type: 'user' | 'role' | 'percentage';
  value: string | number;
}