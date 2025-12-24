// Kafka Producer
export interface ProducerConfig { brokers: string[]; clientId: string; }
export interface ProducerMessage { topic: string; key?: string; value: unknown; headers?: Record<string, string>; }
export class KafkaProducer {
  private connected = false;
  constructor(private config: ProducerConfig) {}
  async connect(): Promise<void> { this.connected = true; console.log("[Kafka] Producer connected to", this.config.brokers); }
  async disconnect(): Promise<void> { this.connected = false; }
  async send(message: ProducerMessage): Promise<void> { if (!this.connected) throw new Error("Not connected"); console.log("[Kafka] Sent to", message.topic, message.value); }
  async sendBatch(messages: ProducerMessage[]): Promise<void> { for (const msg of messages) await this.send(msg); }
}
