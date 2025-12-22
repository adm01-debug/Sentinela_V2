export interface DatadogConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface DatadogResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface DatadogEvent {
  type: string;
  payload: unknown;
  timestamp: Date;
}