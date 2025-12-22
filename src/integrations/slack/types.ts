export interface SlackConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface SlackResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}