export interface PagerdutyConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface PagerdutyResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}