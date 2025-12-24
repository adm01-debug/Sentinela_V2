// Event Sourcing - Export
export * from "./eventStore";
export * from "./aggregate";
export * from "./projection";
export * from "./snapshot";
import { EventStore } from "./eventStore";
import { ProjectionManager } from "./projection";
export const createEventStore = () => new EventStore();
export const createProjectionManager = () => new ProjectionManager();
