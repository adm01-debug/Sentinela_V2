export interface NotionConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface NotionResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}