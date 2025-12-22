export interface AsanaConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface AsanaResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface AsanaEvent {
  type: string;
  payload: unknown;
  timestamp: Date;
}