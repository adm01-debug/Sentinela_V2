export interface NewrelicConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface NewrelicResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}