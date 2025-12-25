/**
 * @fileoverview Ambassador sidecar
 * @module @sentinela/core/sidecar
 * @version 13.0.0
 */

import { AmbassadorConfig } from './types';

export class AmbassadorProxy {
  constructor(private config: AmbassadorConfig) {}
  
  async proxy(request: unknown): Promise<unknown> {
    console.log('Proxying to', this.config.targetService + ':' + this.config.targetPort);
    return { proxied: true, target: this.config.targetService };
  }
  
  getLocalEndpoint(): string { return 'http://localhost:' + this.config.localPort; }
}