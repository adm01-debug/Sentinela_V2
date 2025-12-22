export interface SmsConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface SmsResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}