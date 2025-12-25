/**
 * @fileoverview Sidecar pattern types
 * @module @sentinela/core/sidecar
 * @version 13.0.0
 */

export interface SidecarContainer {
  name: string;
  port: number;
  protocol: string;
  healthEndpoint: string;
}

export interface AmbassadorConfig {
  targetService: string;
  targetPort: number;
  localPort: number;
  retries: number;
  timeout: number;
}