export interface AppConfig {
  apiUrl: string;
  wsUrl: string;
  environment: 'development' | 'staging' | 'production';
  features: FeatureFlags;
  theme: ThemeConfig;
}

export interface FeatureFlags {
  [key: string]: boolean;
}

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
}