export interface AzureConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface AzureResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface AzureEvent {
  type: string;
  payload: unknown;
  timestamp: Date;
}