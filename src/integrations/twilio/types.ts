export interface TwilioConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface TwilioResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}