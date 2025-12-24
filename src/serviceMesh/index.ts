// Service Mesh - Main Export
export * from "./proxy";
export * from "./sidecar";
export * from "./trafficPolicy";
export * from "./mtls";

import { Sidecar, SidecarConfig } from "./sidecar";
import { TrafficPolicyManager } from "./trafficPolicy";
import { MTLSManager } from "./mtls";

export interface ServiceMeshConfig {
  name: string;
  mtlsMode?: "strict" | "permissive" | "disabled";
}

export class ServiceMesh {
  private sidecars: Map<string, Sidecar> = new Map();
  readonly policyManager = new TrafficPolicyManager();
  readonly mtls = new MTLSManager();

  constructor(private config: ServiceMeshConfig) {
    if (config.mtlsMode) this.mtls.setMode(config.mtlsMode);
  }

  deploySidecar(sidecarConfig: SidecarConfig): Sidecar {
    const sidecar = new Sidecar(sidecarConfig);
    this.sidecars.set(sidecarConfig.serviceName, sidecar);
    this.mtls.issueCertificate(sidecarConfig.serviceName);
    sidecar.start();
    return sidecar;
  }

  removeSidecar(serviceName: string): void {
    const sidecar = this.sidecars.get(serviceName);
    if (sidecar) { sidecar.stop(); this.sidecars.delete(serviceName); }
  }

  getSidecar(serviceName: string): Sidecar | undefined {
    return this.sidecars.get(serviceName);
  }
}

export const createServiceMesh = (config: ServiceMeshConfig) => new ServiceMesh(config);
