// CDC - Export
export * from "./changeCapture";
export * from "./debezium";
export * from "./outboxPoller";
export * from "./replicator";
import { ChangeDataCapture } from "./changeCapture";
export const createCDC = () => new ChangeDataCapture();
