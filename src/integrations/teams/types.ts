export interface TeamsConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface TeamsResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}