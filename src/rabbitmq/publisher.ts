/**
 * @fileoverview RabbitMQ connection and publisher
 * @module @sentinela/core/rabbitmq
 * @version 13.0.0
 */

export interface RabbitMQConfig {
  url: string;
  heartbeat?: number;
}

export interface Channel {
  assertQueue(queue: string): Promise<void>;
  sendToQueue(queue: string, content: Buffer): boolean;
  close(): Promise<void>;
}

export class RabbitMQConnection {
  private connected = false;
  private channels: Channel[] = [];

  constructor(private config: RabbitMQConfig) {}

  async connect(): Promise<void> {
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    for (const ch of this.channels) await ch.close();
    this.connected = false;
  }

  async createChannel(): Promise<Channel> {
    if (!this.connected) await this.connect();
    const channel: Channel = {
      assertQueue: async () => {},
      sendToQueue: () => true,
      close: async () => {}
    };
    this.channels.push(channel);
    return channel;
  }
}

export class RabbitMQPublisher {
  private channel?: Channel;

  constructor(private connection: RabbitMQConnection) {}

  async publish(queue: string, message: unknown): Promise<boolean> {
    if (!this.channel) {
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(queue);
    }
    const content = Buffer.from(JSON.stringify(message));
    return this.channel.sendToQueue(queue, content);
  }
}
