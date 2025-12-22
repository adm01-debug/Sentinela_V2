export interface SegmentConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  enabled: boolean;
}

export interface SegmentResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}