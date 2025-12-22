export interface TrelloConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface TrelloResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}