export interface ZendeskConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface ZendeskResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}