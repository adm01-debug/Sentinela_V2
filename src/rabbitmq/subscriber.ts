// RabbitMQ Subscriber
import { RabbitConnection } from "./connection";
export class RabbitSubscriber {
  private handlers: Map<string, (msg: unknown) => Promise<void>> = new Map();
  constructor(private connection: RabbitConnection) {}
  async subscribe(queue: string, handler: (msg: unknown) => Promise<void>): Promise<void> {
    this.handlers.set(queue, handler);
    const channel = await this.connection.createChannel();
    await channel.assertQueue(queue);
    await channel.consume(queue, handler);
  }
  async unsubscribe(queue: string): Promise<void> { this.handlers.delete(queue); }
}
