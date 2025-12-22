export interface GcpConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface GcpResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface GcpEvent {
  type: string;
  payload: unknown;
  timestamp: Date;
}