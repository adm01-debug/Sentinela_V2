/**
 * @fileoverview API composition types
 * @module @sentinela/core/apiComposition
 * @version 13.0.0
 */

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