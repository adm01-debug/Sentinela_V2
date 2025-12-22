export interface SentryConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface SentryResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}