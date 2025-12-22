export interface GoogleanalyticsConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface GoogleanalyticsResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface GoogleanalyticsEvent {
  type: string;
  payload: unknown;
  timestamp: Date;
}