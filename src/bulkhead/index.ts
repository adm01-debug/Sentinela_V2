// Bulkhead Pattern - Export
export * from "./bulkhead";
export * from "./semaphore";
export * from "./threadPool";
export * from "./resourcePool";
import { Bulkhead, BulkheadConfig } from "./bulkhead";
export const createBulkhead = (config: BulkheadConfig) => new Bulkhead(config);
