export interface AnalyticsConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface AnalyticsResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface AnalyticsEvent {
  type: string;
  payload: unknown;
  timestamp: Date;
}