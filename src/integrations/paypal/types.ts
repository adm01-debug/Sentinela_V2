export interface PaypalConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface PaypalResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}