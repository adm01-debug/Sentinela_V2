export interface ConfigEntry {
  key: string;
  value: unknown;
  version: number;
  environment: string;
  application: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConfigQuery {
  application?: string;
  environment?: string;
  prefix?: string;
}