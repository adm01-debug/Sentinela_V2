export interface AzureadConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface AzureadResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface AzureadEvent {
  type: string;
  payload: unknown;
  timestamp: Date;
}