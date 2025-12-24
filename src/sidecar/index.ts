// Sidecar Pattern - Main Export
export * from "./sidecarContainer";
export * from "./loggingSidecar";
export * from "./proxySidecar";
export * from "./configSidecar";

import { SidecarContainer, SidecarConfig } from "./sidecarContainer";
import { LoggingSidecar } from "./loggingSidecar";
import { ProxySidecar } from "./proxySidecar";
import { ConfigSidecar, ConfigSource } from "./configSidecar";

export type SidecarType = "logging" | "proxy" | "config" | "custom";

export interface SidecarFactory {
  create(type: SidecarType, config: SidecarConfig, options?: unknown): SidecarContainer;
}

export const createSidecar = (type: SidecarType, config: SidecarConfig, options?: unknown): SidecarContainer => {
  switch (type) {
    case "logging": return new LoggingSidecar(config, options as ((e: any) => Promise<void>) | undefined);
    case "proxy": return new ProxySidecar(config, options as string || "http://localhost");
    case "config": return new ConfigSidecar(config, options as ConfigSource[] || []);
    default: return new SidecarContainer(config);
  }
};
