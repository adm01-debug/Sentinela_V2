export interface ConfigServerConfig {
  port: number;
  sources: ConfigSource[];
  refreshInterval: number;
  encryption: EncryptionConfig;
}

export interface ConfigSource {
  name: string;
  type: 'file' | 'env' | 'vault' | 'etcd';
  priority: number;
}

export interface EncryptionConfig {
  enabled: boolean;
  algorithm: string;
  keyPath?: string;
}

export interface ConfigValue {
  key: string;
  value: unknown;
  source: string;
  version: number;
  updatedAt: Date;
}