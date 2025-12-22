export interface SendgridConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface SendgridResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}