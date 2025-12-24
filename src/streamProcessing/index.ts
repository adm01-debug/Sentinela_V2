// Stream Processing - Export
export * from "./stream";
export * from "./windowing";
export * from "./aggregation";
export * from "./sink";
import { DataStream } from "./stream";
export const createStream = <T>() => new DataStream<T>();
