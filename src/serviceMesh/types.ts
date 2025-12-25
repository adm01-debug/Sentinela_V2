/**
 * @fileoverview Service mesh types
 * @module @sentinela/core/serviceMesh
 * @version 13.0.0
 */

export interface ServiceMeshConfig {
  name: string;
  namespace: string;
  sidecar: SidecarConfig;
  traffic: TrafficConfig;
  security: SecurityConfig;
}

export interface SidecarConfig {
  enabled: boolean;
  port: number;
  protocol: 'http' | 'grpc';
}

export interface TrafficConfig {
  retries: number;
  timeout: number;
  circuitBreaker: CircuitBreakerConfig;
}

export interface CircuitBreakerConfig {
  enabled: boolean;
  threshold: number;
  timeout: number;
}

export interface SecurityConfig {
  mtls: boolean;
  authPolicy: 'strict' | 'permissive';
}