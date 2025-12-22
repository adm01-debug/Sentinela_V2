export interface SalesforceConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface SalesforceResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}