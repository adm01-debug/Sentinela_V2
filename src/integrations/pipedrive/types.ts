export interface PipedriveConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface PipedriveResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}