// Kafka - Export
export * from "./producer";
export * from "./consumer";
export * from "./admin";
export * from "./streams";
import { KafkaProducer, ProducerConfig } from "./producer";
import { KafkaConsumer, ConsumerConfig } from "./consumer";
export const createProducer = (config: ProducerConfig) => new KafkaProducer(config);
export const createConsumer = (config: ConsumerConfig) => new KafkaConsumer(config);
