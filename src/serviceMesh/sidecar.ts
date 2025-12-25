/**
 * @fileoverview Service Mesh Sidecar
 * @module @sentinela/core/serviceMesh
 */
export interface SidecarConfig { serviceName: string; port: number; }
export class ServiceMeshSidecar {
  private intercepting = false;
  constructor(private config: SidecarConfig) {}
  async start(): Promise<void> { this.intercepting = true; }
  async stop(): Promise<void> { this.intercepting = false; }
  isActive(): boolean { return this.intercepting; }
  async intercept(req: { method: string; path: string }): Promise<{ forwarded: boolean }> {
    return { forwarded: this.intercepting };
  }
}
