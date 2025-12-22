export interface AwsConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface AwsResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface AwsEvent {
  type: string;
  payload: unknown;
  timestamp: Date;
}