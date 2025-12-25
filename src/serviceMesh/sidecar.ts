/**
 * @fileoverview Service Mesh Sidecar
 * @module @sentinela/core/serviceMesh
 * @version 13.0.0
 */
export interface SidecarConfig { serviceName: string; port: number; }
export class Sidecar {
  constructor(private config: SidecarConfig) {}
  async intercept(req: any): Promise<any> { return req; }
  async proxy(target: string, req: any): Promise<any> { return { status: 200 }; }
}
