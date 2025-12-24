// Config Server - Export
export * from "./configServer";
export * from "./configClient";
export * from "./encryption";
export * from "./versioning";
import { ConfigServer } from "./configServer";
export const createConfigServer = () => new ConfigServer();
