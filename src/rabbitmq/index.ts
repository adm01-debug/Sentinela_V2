// RabbitMQ - Export
export * from "./connection";
export * from "./publisher";
export * from "./subscriber";
export * from "./rpc";
import { RabbitConnection, ConnectionConfig } from "./connection";
export const createConnection = (config: ConnectionConfig) => new RabbitConnection(config);
