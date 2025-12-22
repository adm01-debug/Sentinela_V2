export interface StripeConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface StripeResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}