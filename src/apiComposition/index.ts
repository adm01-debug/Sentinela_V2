// API Composition - Export
export * from "./composer";
export * from "./aggregator";
export * from "./merger";
export * from "./gateway";
import { CompositionGateway } from "./gateway";
export const createCompositionGateway = () => new CompositionGateway();
