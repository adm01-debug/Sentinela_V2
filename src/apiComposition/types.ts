export interface CompositionPlan {
  name: string;
  steps: CompositionStep[];
  timeout: number;
  fallback?: unknown;
}

export interface CompositionStep {
  name: string;
  service: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, string>;
  dependsOn?: string[];
  transform?: (data: unknown) => unknown;
}

export interface CompositionResult {
  success: boolean;
  data: Record<string, unknown>;
  errors: Record<string, string>;
  duration: number;
}