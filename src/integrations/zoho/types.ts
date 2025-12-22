export interface ZohoConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface ZohoResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}