export interface MapboxConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface MapboxResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface MapboxEvent {
  type: string;
  payload: unknown;
  timestamp: Date;
}