// Service Discovery - Main Export
export * from "./registry";
export * from "./loadBalancer";
export * from "./healthChecker";
export * from "./client";

import { DefaultServiceDiscoveryClient } from "./client";
export const createServiceDiscoveryClient = () => new DefaultServiceDiscoveryClient();
