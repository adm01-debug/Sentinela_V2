// Service Registry - Export
export * from "./registry";
export * from "./heartbeat";
export * from "./catalog";
export * from "./watcher";
import { ServiceRegistry } from "./registry";
export const createServiceRegistry = () => new ServiceRegistry();
