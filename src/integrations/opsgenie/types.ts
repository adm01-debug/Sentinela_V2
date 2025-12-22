export interface OpsgenieConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface OpsgenieResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}