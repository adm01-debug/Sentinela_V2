export interface OktaConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface OktaResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}