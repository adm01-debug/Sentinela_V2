// RabbitMQ Publisher
import { RabbitConnection } from "./connection";
export class RabbitPublisher {
  constructor(private connection: RabbitConnection, private exchange: string) {}
  async publish(routingKey: string, message: unknown): Promise<void> {
    const channel = await this.connection.createChannel();
    await channel.assertExchange(this.exchange, "topic");
    await channel.publish(this.exchange, routingKey, Buffer.from(JSON.stringify(message)));
  }
  async publishDirect(queue: string, message: unknown): Promise<void> {
    const channel = await this.connection.createChannel();
    await channel.assertQueue(queue);
    await channel.publish("", queue, Buffer.from(JSON.stringify(message)));
  }
}
